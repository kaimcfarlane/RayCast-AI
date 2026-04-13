import SwiftUI

struct WelcomeView: View {
    var onGetStarted: () -> Void
    @State private var menuVisible = false

    var body: some View {
        ZStack {
            AppTheme.background.ignoresSafeArea()

            VStack(spacing: 0) {
                HStack {
                    Button(action: { withAnimation { menuVisible = true } }) {
                        Image(systemName: "line.3.horizontal")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(width: 38, height: 38)
                            .background(AppTheme.menuIconBg)
                            .clipShape(Circle())
                    }
                    Spacer()
                }
                .padding(.bottom, 24)

                Text("Welcome to\nRayCast AI!")
                    .font(.system(size: 34, weight: .bold))
                    .foregroundColor(AppTheme.text)
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: .infinity)
                    .padding(.bottom, 24)

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 14) {
                        FeatureCard(
                            icon: "eye",
                            title: "Real-Time Vision",
                            description: "AI sees what you see and understands your environment"
                        )
                        FeatureCard(
                            icon: "mic",
                            title: "Voice Interaction",
                            description: "Speak naturally and get instant, context-aware responses"
                        )
                        FeatureCard(
                            icon: "star",
                            title: "Smart Assistance",
                            description: "Task focused modes for chess, navigation, reading, and more"
                        )
                        FeatureCard(
                            icon: "shield.checkered",
                            title: "Privacy First",
                            description: "Your data stays secure with privacy-by-design controls"
                        )
                    }
                    .padding(.bottom, 28)

                    VStack(spacing: 14) {
                        GradientButton(title: "Get Started", variant: .primary, action: onGetStarted)
                    }
                    .padding(.bottom, 24)
                }
            }
            .padding(.horizontal, 24)
            .padding(.top, 16)

            MenuOverlayView(isVisible: $menuVisible)
        }
    }
}

private struct FeatureCard: View {
    let icon: String
    let title: String
    let description: String

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundColor(AppTheme.textSecondary)
                .frame(width: 48, height: 48)
                .background(AppTheme.surfaceElevated)
                .clipShape(Circle())

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(AppTheme.text)
                Text(description)
                    .font(.system(size: 14))
                    .foregroundColor(AppTheme.textSecondary)
                    .lineSpacing(2)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(AppTheme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}
