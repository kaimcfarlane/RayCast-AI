import AVFoundation
import Speech
import SwiftUI

@MainActor
final class SpeechRecognitionService: ObservableObject {
    @Published private(set) var transcribedText: String = ""
    @Published private(set) var isListening: Bool = false
    @Published private(set) var isAuthorized: Bool = false

    /// After this much quiet time following the last partial transcript, we treat the utterance as complete.
    var silenceCommitDuration: TimeInterval = 1.85

    /// If the mic is open but the user says nothing (no non-empty partials) for this long, we notify and stop.
    /// Resets whenever a non-empty partial transcript arrives (user is still engaged).
    var extendedIdlePauseDuration: TimeInterval = 28

    /// Called on the main actor when the user pauses long enough after speaking (end of utterance).
    var onSilenceCommit: ((String) -> Void)?

    /// Called when the mic has been open with no meaningful speech for `extendedIdlePauseDuration` (conversation idle).
    var onExtendedSilenceWhileListening: (() -> Void)?

    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
    private let audioEngine = AVAudioEngine()
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private var silenceCommitTask: Task<Void, Never>?
    private var extendedIdleTask: Task<Void, Never>?

    init() {
        checkAuthorization()
    }

    func checkAuthorization() {
        SFSpeechRecognizer.requestAuthorization { [weak self] status in
            Task { @MainActor in
                self?.isAuthorized = (status == .authorized)
            }
        }
    }

    func startListening() {
        guard !isListening else { return }
        guard speechRecognizer?.isAvailable == true else {
            print("[RayCastAI] Speech recognizer not available")
            return
        }

        stopListening()
        transcribedText = ""
        cancelSilenceCommitTimer()
        cancelExtendedIdleTimer()

        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            print("[RayCastAI] Audio session config failed: \(error)")
            return
        }

        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let recognitionRequest else { return }

        recognitionRequest.shouldReportPartialResults = true
        recognitionRequest.addsPunctuation = true

        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)

        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
            recognitionRequest.append(buffer)
        }

        recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest) { [weak self] result, error in
            Task { @MainActor in
                guard let self else { return }
                if let result {
                    let formatted = result.bestTranscription.formattedString
                    self.transcribedText = formatted
                    self.scheduleSilenceCommitIfNeeded()
                    if !formatted.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                        self.scheduleExtendedIdleTimer()
                    }
                }
                // Do not stop on `isFinal` alone — that fires between phrases and caused constant listen/stop toggling.
                // Rely on silence detection, explicit stop, or a hard error instead.
                if error != nil, self.isListening {
                    self.finishListening()
                }
            }
        }

        do {
            try audioEngine.start()
            isListening = true
            scheduleExtendedIdleTimer()
        } catch {
            print("[RayCastAI] Audio engine start failed: \(error)")
            finishListening()
        }
    }

    func stopListening() {
        guard isListening else { return }
        cancelSilenceCommitTimer()
        cancelExtendedIdleTimer()
        finishListening()
    }

    func getFinalText() -> String {
        return transcribedText.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private func finishListening() {
        cancelSilenceCommitTimer()
        cancelExtendedIdleTimer()
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        recognitionRequest = nil
        recognitionTask?.cancel()
        recognitionTask = nil
        isListening = false

        let audioSession = AVAudioSession.sharedInstance()
        try? audioSession.setCategory(.playback, mode: .spokenAudio, options: .duckOthers)
        try? audioSession.setActive(true)
    }

    private func cancelSilenceCommitTimer() {
        silenceCommitTask?.cancel()
        silenceCommitTask = nil
    }

    private func scheduleSilenceCommitIfNeeded() {
        cancelSilenceCommitTimer()
        silenceCommitTask = Task { @MainActor in
            let nanos = UInt64(silenceCommitDuration * 1_000_000_000)
            try? await Task.sleep(nanoseconds: nanos)
            guard !Task.isCancelled, self.isListening else { return }
            let text = self.getFinalText()
            guard !text.isEmpty else { return }
            self.onSilenceCommit?(text)
            self.finishListening()
        }
    }

    private func scheduleExtendedIdleTimer() {
        cancelExtendedIdleTimer()
        extendedIdleTask = Task { @MainActor in
            let nanos = UInt64(extendedIdlePauseDuration * 1_000_000_000)
            try? await Task.sleep(nanoseconds: nanos)
            guard !Task.isCancelled, self.isListening else { return }
            self.onExtendedSilenceWhileListening?()
            self.finishListening()
        }
    }

    private func cancelExtendedIdleTimer() {
        extendedIdleTask?.cancel()
        extendedIdleTask = nil
    }
}
