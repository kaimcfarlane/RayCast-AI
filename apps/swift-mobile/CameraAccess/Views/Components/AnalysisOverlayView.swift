import SwiftUI

struct AnalysisOverlayView: View {
    let messages: [AnalysisMessage]
    let isAnalyzing: Bool
    let taskMode: TaskMode?
    var isListening: Bool = false
    var partialTranscript: String = ""
    var streamError: String? = nil

    private var visibleMessages: [AnalysisMessage] {
        Array(messages.suffix(3))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            if isAnalyzing {
                analysingIndicator
            }

            if isListening {
                listeningIndicator
            }

            ForEach(Array(visibleMessages.enumerated()), id: \.element.id) { index, message in
                let opacity = messageOpacity(index: index, total: visibleMessages.count)
                MessageBubbleView(
                    text: message.text,
                    timestamp: message.timestamp,
                    sender: message.sender
                )
                .opacity(opacity)
                .transition(.asymmetric(
                    insertion: .move(edge: .bottom).combined(with: .opacity),
                    removal: .opacity
                ))
            }
        }
        .padding(.horizontal, 16)
        .padding(.bottom, 8)
        .animation(.easeInOut(duration: 0.3), value: messages.count)
    }

    private var analysingIndicator: some View {
        HStack(spacing: 8) {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                .scaleEffect(0.8)
            Text("Analyzing...")
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.white.opacity(0.8))
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(.ultraThinMaterial)
        .clipShape(Capsule())
    }

    private var listeningIndicator: some View {
        HStack(spacing: 8) {
            PulsingMicDot()
            VStack(alignment: .leading, spacing: 2) {
                Text("Listening...")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
                if !partialTranscript.isEmpty {
                    Text(partialTranscript)
                        .font(.system(size: 11))
                        .foregroundColor(.white.opacity(0.6))
                        .lineLimit(2)
                }
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private func messageOpacity(index: Int, total: Int) -> Double {
        guard total > 1 else { return 1.0 }
        let position = Double(index) / Double(total - 1)
        return 0.4 + 0.6 * position
    }
}

struct MessageBubbleView: View {
    let text: String
    let timestamp: Date
    let sender: MessageSender

    private var isUser: Bool { sender == .user }

    var body: some View {
        HStack {
            if isUser { Spacer(minLength: 40) }

            HStack(alignment: .bottom, spacing: 8) {
                Text(text)
                    .font(.system(size: 14, weight: .regular))
                    .foregroundColor(.white)
                    .multilineTextAlignment(isUser ? .trailing : .leading)
                    .fixedSize(horizontal: false, vertical: true)

                Text(timeString)
                    .font(.system(size: 10))
                    .foregroundColor(.white.opacity(0.5))
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(isUser ? Color.blue.opacity(0.4) : Color.black.opacity(0.55))
            .background(.ultraThinMaterial.opacity(0.3))
            .clipShape(RoundedRectangle(cornerRadius: 14))

            if !isUser { Spacer(minLength: 40) }
        }
    }

    private var timeString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm"
        return formatter.string(from: timestamp)
    }
}

struct PulsingMicDot: View {
    @State private var isPulsing = false

    var body: some View {
        Image(systemName: "mic.fill")
            .font(.system(size: 14))
            .foregroundColor(.red)
            .scaleEffect(isPulsing ? 1.2 : 0.9)
            .opacity(isPulsing ? 1.0 : 0.6)
            .animation(
                .easeInOut(duration: 0.6).repeatForever(autoreverses: true),
                value: isPulsing
            )
            .onAppear { isPulsing = true }
    }
}

struct ErrorBannerView: View {
    let message: String

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 14))
                .foregroundColor(.white)
            Text(message)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.white)
                .lineLimit(2)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.red.opacity(0.7))
        .background(.ultraThinMaterial.opacity(0.3))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .transition(.move(edge: .top).combined(with: .opacity))
    }
}
