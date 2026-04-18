import SwiftUI

enum GradientButtonVariant {
    case primary
    case secondary
}

struct GradientButton: View {
    let title: String
    var variant: GradientButtonVariant = .primary
    var isDisabled: Bool = false
    var action: () -> Void

    @State private var isPressed = false

    var body: some View {
        Button(action: action) {
            Group {
                switch variant {
                case .primary:
                    primaryContent
                case .secondary:
                    secondaryContent
                }
            }
            .scaleEffect(isPressed ? 0.97 : 1.0)
            .animation(.easeInOut(duration: 0.15), value: isPressed)
        }
        .buttonStyle(.plain)
        .disabled(isDisabled)
        .opacity(isDisabled ? 0.6 : 1.0)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in isPressed = true }
                .onEnded { _ in isPressed = false }
        )
    }

    private var primaryContent: some View {
        Text(title)
            .font(.system(size: 17, weight: .semibold))
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 54)
            .background(AppTheme.gradient)
            .clipShape(RoundedRectangle(cornerRadius: 28))
    }

    private var secondaryContent: some View {
        Text(title)
            .font(.system(size: 17, weight: .semibold))
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 54)
            .background(AppTheme.background)
            .clipShape(RoundedRectangle(cornerRadius: 28))
            .overlay(
                RoundedRectangle(cornerRadius: 28)
                    .stroke(AppTheme.borderGradient, lineWidth: 2)
            )
    }
}
