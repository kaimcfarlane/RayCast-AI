import SwiftUI

struct AnalysisOverlayView: View {
    let messages: [AnalysisMessage]
    let isAnalyzing: Bool
    let taskMode: TaskMode?

    private var visibleMessages: [AnalysisMessage] {
        Array(messages.suffix(3))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            if isAnalyzing {
                analysingIndicator
            }

            ForEach(Array(visibleMessages.enumerated()), id: \.element.id) { index, message in
                let opacity = messageOpacity(index: index, total: visibleMessages.count)
                MessageBubbleView(text: message.text, timestamp: message.timestamp)
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
        HStack(spacing: 6) {
            PulsingDot()
            Text("Analyzing...")
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.white.opacity(0.8))
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(.ultraThinMaterial)
        .clipShape(Capsule())
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

    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            Text(text)
                .font(.system(size: 14, weight: .regular))
                .foregroundColor(.white)
                .multilineTextAlignment(.leading)
                .fixedSize(horizontal: false, vertical: true)

            Text(timeString)
                .font(.system(size: 10))
                .foregroundColor(.white.opacity(0.5))
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.black.opacity(0.55))
        .background(.ultraThinMaterial.opacity(0.3))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private var timeString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm"
        return formatter.string(from: timestamp)
    }
}

struct PulsingDot: View {
    @State private var isPulsing = false

    var body: some View {
        Circle()
            .fill(Color.green)
            .frame(width: 8, height: 8)
            .scaleEffect(isPulsing ? 1.3 : 0.8)
            .opacity(isPulsing ? 1.0 : 0.5)
            .animation(
                .easeInOut(duration: 0.8).repeatForever(autoreverses: true),
                value: isPulsing
            )
            .onAppear { isPulsing = true }
    }
}
