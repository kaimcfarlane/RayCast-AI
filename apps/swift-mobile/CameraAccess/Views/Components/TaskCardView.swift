import SwiftUI

struct TaskCardView: View {
    let icon: String
    let label: String
    let isSelected: Bool
    let action: () -> Void

    @State private var isPressed = false

    var body: some View {
        Button(action: {
            let generator = UIImpactFeedbackGenerator(style: .light)
            generator.impactOccurred()
            action()
        }) {
            VStack(spacing: 8) {
                iconView
                Text(label)
                    .font(.system(size: 14, weight: isSelected ? .semibold : .medium))
                    .foregroundColor(isSelected ? AppTheme.gradientEnd : AppTheme.text)
            }
            .frame(maxWidth: .infinity)
            .frame(minHeight: 100)
            .background(isSelected ? AppTheme.surfaceElevated : AppTheme.surface)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(
                        isSelected ? AppTheme.gradient : LinearGradient(colors: [.clear], startPoint: .leading, endPoint: .trailing),
                        lineWidth: 2
                    )
            )
            .scaleEffect(isPressed ? 0.97 : 1.0)
            .animation(.easeInOut(duration: 0.15), value: isPressed)
        }
        .buttonStyle(.plain)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in isPressed = true }
                .onEnded { _ in isPressed = false }
        )
    }

    @ViewBuilder
    private var iconView: some View {
        if isSelected {
            Image(systemName: icon)
                .font(.system(size: 28))
                .foregroundColor(.white)
                .frame(width: 56, height: 56)
                .background(AppTheme.gradient)
                .clipShape(RoundedRectangle(cornerRadius: 14))
        } else {
            Image(systemName: icon)
                .font(.system(size: 28))
                .foregroundColor(AppTheme.textSecondary)
                .frame(width: 56, height: 56)
                .background(AppTheme.surfaceElevated)
                .clipShape(RoundedRectangle(cornerRadius: 14))
        }
    }
}
