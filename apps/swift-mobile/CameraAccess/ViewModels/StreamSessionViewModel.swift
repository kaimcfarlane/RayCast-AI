/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

//
// StreamSessionViewModel.swift
//
// Core view model demonstrating video streaming from Meta wearable devices using the DAT SDK.
// This class showcases the key streaming patterns: device selection, session management,
// video frame handling, photo capture, and error handling.
//

import MWDATCamera
import MWDATCore
import SwiftUI

enum StreamingStatus {
  case streaming
  case waiting
  case stopped
}

enum MessageSender {
  case user
  case assistant
}

struct AnalysisMessage: Identifiable {
  let id = UUID()
  let text: String
  let timestamp: Date
  let sender: MessageSender
}

@MainActor
class StreamSessionViewModel: ObservableObject {
  @Published var currentVideoFrame: UIImage?
  @Published var hasReceivedFirstFrame: Bool = false
  @Published var streamingStatus: StreamingStatus = .stopped
  @Published var showError: Bool = false
  @Published var errorMessage: String = ""
  @Published var hasActiveDevice: Bool = false

  // Analysis pipeline state
  @Published var analysisMessages: [AnalysisMessage] = []
  @Published var isAnalyzing: Bool = false
  @Published var taskMode: TaskMode?
  @Published var searchQuery: String = ""
  @Published var streamError: String?

  // Talk mode state
  @Published var isTalkProcessing: Bool = false

  let speechService = SpeechRecognitionService()

  var isTalkMode: Bool { taskMode == .general }

  var isStreaming: Bool {
    streamingStatus != .stopped
  }

  // Photo capture properties
  @Published var capturedPhoto: UIImage?
  @Published var showPhotoPreview: Bool = false

  let audioPlayer = AudioPlayerService()

  private var streamSession: StreamSession
  private var stateListenerToken: AnyListenerToken?
  private var videoFrameListenerToken: AnyListenerToken?
  private var errorListenerToken: AnyListenerToken?
  private var photoDataListenerToken: AnyListenerToken?
  private let wearables: WearablesInterface
  private let deviceSelector: AutoDeviceSelector
  private var deviceMonitorTask: Task<Void, Never>?

  // Frame ring buffer: stores the most recent frames for sampling
  private let bufferCapacity = 120
  private var frameBuffer: [UIImage] = []
  private var bufferIndex = 0

  // Analysis timing
  private var analysisTimer: Task<Void, Never>?
  private let captureIntervalSeconds: TimeInterval = 5.0
  private let frameSampleCount = 6
  private let sessionId = "session-\(UUID().uuidString.prefix(8))"

  init(wearables: WearablesInterface) {
    self.wearables = wearables
    self.deviceSelector = AutoDeviceSelector(wearables: wearables)
    let config = StreamSessionConfig(
      videoCodec: VideoCodec.raw,
      resolution: StreamingResolution.low,
      frameRate: 24)
    streamSession = StreamSession(streamSessionConfig: config, deviceSelector: deviceSelector)

    frameBuffer.reserveCapacity(bufferCapacity)

    deviceMonitorTask = Task { @MainActor in
      for await device in deviceSelector.activeDeviceStream() {
        self.hasActiveDevice = device != nil
      }
    }

    stateListenerToken = streamSession.statePublisher.listen { [weak self] state in
      Task { @MainActor [weak self] in
        self?.updateStatusFromState(state)
      }
    }

    videoFrameListenerToken = streamSession.videoFramePublisher.listen { [weak self] videoFrame in
      Task { @MainActor [weak self] in
        guard let self else { return }

        if let image = videoFrame.makeUIImage() {
          self.currentVideoFrame = image
          self.pushFrameToBuffer(image)
          if !self.hasReceivedFirstFrame {
            self.hasReceivedFirstFrame = true
          }
        }
      }
    }

    errorListenerToken = streamSession.errorPublisher.listen { [weak self] error in
      Task { @MainActor [weak self] in
        guard let self else { return }
        let newErrorMessage = formatStreamingError(error)
        if newErrorMessage != self.errorMessage {
          showError(newErrorMessage)
        }
      }
    }

    updateStatusFromState(streamSession.state)

    photoDataListenerToken = streamSession.photoDataPublisher.listen { [weak self] photoData in
      Task { @MainActor [weak self] in
        guard let self else { return }
        if let uiImage = UIImage(data: photoData.data) {
          self.capturedPhoto = uiImage
          self.showPhotoPreview = true
        }
      }
    }
  }

  // MARK: - Frame ring buffer

  private func pushFrameToBuffer(_ image: UIImage) {
    if frameBuffer.count < bufferCapacity {
      frameBuffer.append(image)
    } else {
      frameBuffer[bufferIndex] = image
    }
    bufferIndex = (bufferIndex + 1) % bufferCapacity
  }

  private func sampleFrames() -> [UIImage] {
    let count = frameBuffer.count
    guard count >= frameSampleCount else { return frameBuffer }

    var samples: [UIImage] = []
    for i in 0..<frameSampleCount {
      let idx = i * (count - 1) / max(frameSampleCount - 1, 1)
      samples.append(frameBuffer[idx])
    }
    return samples
  }

  // MARK: - Analysis pipeline

  private func startAnalysisLoop() {
    guard !isTalkMode else { return }
    analysisTimer?.cancel()
    analysisTimer = Task { @MainActor [weak self] in
      guard let self else { return }
      try? await Task.sleep(for: .seconds(self.captureIntervalSeconds))

      while !Task.isCancelled {
        guard self.streamingStatus == .streaming, !self.isTalkMode else { break }
        guard !self.isAnalyzing, !self.audioPlayer.isPlaying else {
          try? await Task.sleep(for: .milliseconds(500))
          continue
        }

        await self.runAnalysisCycle()
        try? await Task.sleep(for: .seconds(self.captureIntervalSeconds))
      }
    }
  }

  private func stopAnalysisLoop() {
    analysisTimer?.cancel()
    analysisTimer = nil
  }

  private func runAnalysisCycle() async {
    let mode = taskMode ?? .general
    let frames = sampleFrames()
    guard !frames.isEmpty else { return }

    isAnalyzing = true
    defer { isAnalyzing = false }

    do {
      let response = try await APIService.shared.analyzeStream(
        frames: frames,
        taskMode: mode.rawValue,
        sessionId: sessionId,
        searchQuery: mode == .findObject ? searchQuery : nil
      )

      guard response.changed else { return }

      if let text = response.analysisText, !text.isEmpty {
        appendMessage(text, sender: .assistant)
      }

      if let audioBase64 = response.audioBase64, !audioBase64.isEmpty {
        audioPlayer.playBase64Audio(audioBase64)
      }
    } catch {
      print("[RayCastAI] Analysis cycle error: \(error.localizedDescription)")
      showStreamError(error.localizedDescription)
    }
  }

  // MARK: - Streaming lifecycle

  func handleStartStreaming() async {
    let permission = Permission.camera
    do {
      let status = try await wearables.checkPermissionStatus(permission)
      if status == .granted {
        await startSession()
        return
      }
      let requestStatus = try await wearables.requestPermission(permission)
      if requestStatus == .granted {
        await startSession()
        return
      }
      showError("Permission denied")
    } catch {
      showError("Permission error: \(error.description)")
    }
  }

  func startSession() async {
    await streamSession.start()
  }

  private func showError(_ message: String) {
    errorMessage = message
    showError = true
  }

  func stopSession() async {
    stopAnalysisLoop()
    speechService.stopListening()
    await streamSession.stop()
    audioPlayer.stop()
  }

  func dismissError() {
    showError = false
    errorMessage = ""
  }

  // MARK: - Talk mode

  func toggleListening() {
    guard isTalkMode, !isTalkProcessing, !audioPlayer.isPlaying else { return }

    if speechService.isListening {
      speechService.stopListening()
      let text = speechService.getFinalText()
      guard !text.isEmpty else { return }
      Task { await handleTalkInput(text) }
    } else {
      speechService.startListening()
    }
  }

  private func handleTalkInput(_ userText: String) async {
    isTalkProcessing = true
    defer { isTalkProcessing = false }

    appendMessage(userText, sender: .user)

    let frames = sampleFrames()
    isAnalyzing = true
    defer { isAnalyzing = false }

    do {
      let response = try await APIService.shared.chat(
        userText: userText,
        sessionId: sessionId,
        frames: frames
      )

      appendMessage(response.responseText, sender: .assistant)

      if let audioBase64 = response.audioBase64, !audioBase64.isEmpty {
        audioPlayer.playBase64Audio(audioBase64)
        while audioPlayer.isPlaying {
          try? await Task.sleep(for: .milliseconds(200))
        }
        try? await Task.sleep(for: .seconds(2))
      }
    } catch {
      print("[RayCastAI] Chat error: \(error.localizedDescription)")
      showStreamError(error.localizedDescription)
    }
  }

  // MARK: - Helpers

  private func appendMessage(_ text: String, sender: MessageSender) {
    let message = AnalysisMessage(text: text, timestamp: Date(), sender: sender)
    analysisMessages.append(message)
    if analysisMessages.count > 10 {
      analysisMessages.removeFirst(analysisMessages.count - 10)
    }
  }

  private func showStreamError(_ message: String) {
    streamError = message
    Task {
      try? await Task.sleep(for: .seconds(4))
      if streamError == message {
        streamError = nil
      }
    }
  }

  func capturePhoto() {
    streamSession.capturePhoto(format: .jpeg)
  }

  func dismissPhotoPreview() {
    showPhotoPreview = false
    capturedPhoto = nil
  }

  private func updateStatusFromState(_ state: StreamSessionState) {
    switch state {
    case .stopped:
      currentVideoFrame = nil
      streamingStatus = .stopped
      stopAnalysisLoop()
    case .waitingForDevice, .starting, .stopping, .paused:
      streamingStatus = .waiting
    case .streaming:
      streamingStatus = .streaming
      startAnalysisLoop()
    }
  }

  private func formatStreamingError(_ error: StreamSessionError) -> String {
    switch error {
    case .internalError:
      return "An internal error occurred. Please try again."
    case .deviceNotFound:
      return "Device not found. Please ensure your device is connected."
    case .deviceNotConnected:
      return "Device not connected. Please check your connection and try again."
    case .timeout:
      return "The operation timed out. Please try again."
    case .videoStreamingError:
      return "Video streaming failed. Please try again."
    case .audioStreamingError:
      return "Audio streaming failed. Please try again."
    case .permissionDenied:
      return "Camera permission denied. Please grant permission in Settings."
    case .hingesClosed:
      return "The hinges on the glasses were closed. Please open the hinges and try again."
    @unknown default:
      return "An unknown streaming error occurred."
    }
  }
}
