import AVFoundation
import Foundation

@MainActor
final class AudioPlayerService: NSObject, ObservableObject {
    @Published private(set) var isPlaying = false

    private var player: AVAudioPlayer?
    private var completion: (() -> Void)?

    override init() {
        super.init()
        configureAudioSession()
    }

    func playBase64Audio(_ base64String: String, completion: (() -> Void)? = nil) {
        guard let data = Data(base64Encoded: base64String) else {
            completion?()
            return
        }
        playAudioData(data, completion: completion)
    }

    func playAudioData(_ data: Data, completion: (() -> Void)? = nil) {
        stop()
        self.completion = completion

        do {
            player = try AVAudioPlayer(data: data)
            player?.delegate = self
            player?.prepareToPlay()
            player?.play()
            isPlaying = true
        } catch {
            isPlaying = false
            self.completion?()
            self.completion = nil
        }
    }

    func stop() {
        player?.stop()
        player = nil
        isPlaying = false
        completion?()
        completion = nil
    }

    private func configureAudioSession() {
        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.playback, mode: .spokenAudio, options: [.duckOthers])
            try audioSession.setActive(true)
        } catch {
            // Audio session configuration failed — playback may not work as expected
        }
    }
}

extension AudioPlayerService: @preconcurrency AVAudioPlayerDelegate {
    nonisolated func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        Task { @MainActor in
            self.isPlaying = false
            self.completion?()
            self.completion = nil
        }
    }

    nonisolated func audioPlayerDecodeErrorDidOccur(_ player: AVAudioPlayer, error: (any Error)?) {
        Task { @MainActor in
            self.isPlaying = false
            self.completion?()
            self.completion = nil
        }
    }
}
