import MWDATCore
import SwiftUI

struct ConnectView: View {
    @ObservedObject var viewModel: WearablesViewModel
    var onSkip: () -> Void
    @State private var menuVisible = false

    private var isPairing: Bool {
        viewModel.registrationState == .registering
    }

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

                Text("Connect Your Glasses")
                    .font(.system(size: 34, weight: .bold))
                    .foregroundColor(AppTheme.text)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.bottom, 8)

                Text("Pair Meta Ray-Ban to start")
                    .font(.system(size: 16))
                    .foregroundColor(AppTheme.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.bottom, 24)

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 16) {
                        searchCard
                        statusCard
                        setupStepsCard
                        buttonsSection
                    }
                    .padding(.bottom, 24)
                }
            }
            .padding(.horizontal, 24)
            .padding(.top, 16)

            MenuOverlayView(isVisible: $menuVisible)
        }
    }

    private var searchCard: some View {
        VStack(spacing: 12) {
            Image(systemName: "eyeglasses")
                .font(.system(size: 52))
                .foregroundColor(.white.opacity(0.85))
            Text(isPairing ? "Connecting to glasses..." : "Searching for devices...")
                .font(.system(size: 16))
                .foregroundColor(.white.opacity(0.8))
        }
        .frame(maxWidth: .infinity)
        .padding(32)
        .background(AppTheme.diagonalGradient)
        .clipShape(RoundedRectangle(cornerRadius: 20))
    }

    private var statusCard: some View {
        HStack(spacing: 14) {
            Image(systemName: "antenna.radiowaves.left.and.right")
                .font(.system(size: 18))
                .foregroundColor(isPairing ? .orange : .red)
                .frame(width: 44, height: 44)
                .background(Color.red.opacity(0.15))
                .clipShape(Circle())

            Text(isPairing ? "Connecting..." : "Not Connected")
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(AppTheme.text)

            Spacer()
        }
        .padding(18)
        .background(AppTheme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var setupStepsCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Setup Steps")
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(AppTheme.text)

            VStack(alignment: .leading, spacing: 8) {
                stepText("1. In Meta AI app: turn on Developer Mode (Profile → Settings → Developer mode)")
                stepText("2. Turn on your glasses and enable Bluetooth")
                stepText("3. Tap \u{201C}Start Pairing\u{201D} — approve connecting RayCast AI in Meta AI if prompted")
                stepText("4. Return to this app after authorizing")
                Text("If Meta AI opens to the home screen: open Menu → Device settings and look for \u{201C}Connected apps\u{201D} or \u{201C}Developer\u{201D} to add or approve RayCast AI.")
                    .font(.system(size: 13))
                    .foregroundColor(AppTheme.textMuted)
                    .italic()
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(AppTheme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private func stepText(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 14))
            .foregroundColor(AppTheme.textSecondary)
            .lineSpacing(2)
    }

    private var buttonsSection: some View {
        VStack(spacing: 14) {
            GradientButton(
                title: isPairing ? "Connecting..." : "Start Pairing",
                variant: .primary,
                isDisabled: isPairing
            ) {
                viewModel.connectGlasses()
            }

            GradientButton(title: "Skip for now", variant: .secondary) {
                onSkip()
            }
        }
        .padding(.top, 8)
    }
}
