/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import MWDATCore
import SwiftUI

struct StreamView: View {
    @ObservedObject var viewModel: StreamSessionViewModel
    @ObservedObject var wearablesVM: WearablesViewModel
    var onBackToHome: (() -> Void)?

    @State private var showStoppedOverlay = false

    var body: some View {
        ZStack {
            Color.black
                .edgesIgnoringSafeArea(.all)

            if let videoFrame = viewModel.currentVideoFrame, viewModel.hasReceivedFirstFrame {
                GeometryReader { geometry in
                    Image(uiImage: videoFrame)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: geometry.size.width, height: geometry.size.height)
                        .clipped()
                }
                .edgesIgnoringSafeArea(.all)
            } else if !showStoppedOverlay {
                ProgressView()
                    .scaleEffect(1.5)
                    .foregroundColor(.white)
            }

            if showStoppedOverlay {
                stoppedOverlay
            } else {
                VStack(spacing: 0) {
                    HStack(alignment: .top) {
                        taskModeBadge
                        Spacer()
                    }

                    if let error = viewModel.streamError {
                        ErrorBannerView(message: error)
                            .padding(.top, 4)
                    }

                    Spacer()

                    AnalysisOverlayView(
                        messages: viewModel.analysisMessages,
                        isAnalyzing: viewModel.isAnalyzing,
                        taskMode: viewModel.taskMode,
                        isListening: viewModel.speechService.isListening,
                        partialTranscript: viewModel.speechService.transcribedText,
                        streamError: viewModel.streamError
                    )

                    ControlsView(viewModel: viewModel) {
                        Task {
                            await viewModel.stopSession()
                            withAnimation { showStoppedOverlay = true }
                        }
                    }
                }
                .padding(.all, 24)
                .animation(.easeInOut(duration: 0.3), value: viewModel.streamError)
            }
        }
        .onDisappear {
            Task {
                if viewModel.streamingStatus != .stopped {
                    await viewModel.stopSession()
                }
            }
        }
        .sheet(isPresented: $viewModel.showPhotoPreview) {
            if let photo = viewModel.capturedPhoto {
                PhotoPreviewView(
                    photo: photo,
                    onDismiss: {
                        viewModel.dismissPhotoPreview()
                    }
                )
            }
        }
    }

    @ViewBuilder
    private var taskModeBadge: some View {
        if let mode = viewModel.taskMode {
            HStack(spacing: 6) {
                Image(systemName: mode.icon)
                    .font(.system(size: 12, weight: .semibold))
                Text(mode.label)
                    .font(.system(size: 12, weight: .semibold))
            }
            .foregroundColor(.white)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(Color.black.opacity(0.5))
            .background(.ultraThinMaterial.opacity(0.3))
            .clipShape(Capsule())
        }
    }

    private var stoppedOverlay: some View {
        ZStack {
            Color.black.edgesIgnoringSafeArea(.all)

            VStack(spacing: 20) {
                Image(systemName: "checkmark.circle")
                    .font(.system(size: 64))
                    .foregroundColor(AppTheme.gradientEnd)

                Text("Streaming Ended")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(.white)

                Text("Your session has been saved.")
                    .font(.system(size: 15))
                    .foregroundColor(.white.opacity(0.7))

                GradientButton(title: "Back to Home", variant: .primary) {
                    showStoppedOverlay = false
                    onBackToHome?()
                }
                .padding(.top, 16)
                .padding(.horizontal, 24)
            }
        }
    }
}

struct ControlsView: View {
    @ObservedObject var viewModel: StreamSessionViewModel
    var onStop: () -> Void

    private var isTalkBusy: Bool {
        viewModel.isTalkProcessing || viewModel.audioPlayer.isPlaying
    }

    var body: some View {
        HStack(spacing: 8) {
            CustomButton(
                title: "Stop streaming",
                style: .destructive,
                isDisabled: false
            ) {
                onStop()
            }

            if viewModel.isTalkMode {
                CircleButton(
                    icon: viewModel.speechService.isListening ? "mic.slash.fill" : "mic.fill",
                    text: nil
                ) {
                    viewModel.toggleListening()
                }
                .opacity(isTalkBusy ? 0.4 : 1.0)
                .disabled(isTalkBusy)
            } else {
                CircleButton(icon: "camera.fill", text: nil) {
                    viewModel.capturePhoto()
                }
            }
        }
    }
}
