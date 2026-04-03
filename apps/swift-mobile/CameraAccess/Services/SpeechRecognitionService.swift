import AVFoundation
import Speech
import SwiftUI

@MainActor
final class SpeechRecognitionService: ObservableObject {
    @Published private(set) var transcribedText: String = ""
    @Published private(set) var isListening: Bool = false
    @Published private(set) var isAuthorized: Bool = false

    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
    private let audioEngine = AVAudioEngine()
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?

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
                    self.transcribedText = result.bestTranscription.formattedString
                }
                if error != nil || (result?.isFinal == true) {
                    if self.isListening {
                        self.finishListening()
                    }
                }
            }
        }

        do {
            try audioEngine.start()
            isListening = true
        } catch {
            print("[RayCastAI] Audio engine start failed: \(error)")
            finishListening()
        }
    }

    func stopListening() {
        guard isListening else { return }
        finishListening()
    }

    func getFinalText() -> String {
        return transcribedText.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private func finishListening() {
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
}
