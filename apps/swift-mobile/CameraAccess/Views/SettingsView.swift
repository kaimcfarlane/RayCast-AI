import SwiftUI

struct SettingsView: View {
    var onConnectGlasses: () -> Void
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

                VStack(alignment: .leading, spacing: 4) {
                    Text("Settings")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(AppTheme.text)
                    Text("Preferences & account")
                        .font(.system(size: 16))
                        .foregroundColor(AppTheme.textSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.bottom, 16)

                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 24) {
                        settingsSection(title: "DEVICE") {
                            settingsRow(icon: "eyeglasses", label: "Connect glasses", showChevron: true) {
                                onConnectGlasses()
                            }
                        }

                        settingsSection(title: "APP") {
                            VStack(spacing: 8) {
                                settingsRow(icon: "bell", label: "Notifications", showChevron: true) {}
                                settingsRow(icon: "lock.fill", label: "Privacy", showChevron: true) {}
                            }
                        }

                        settingsSection(title: "ABOUT") {
                            settingsRow(icon: "info.circle", label: "RayCast AI v1.0.0", showChevron: false) {}
                        }
                    }
                    .padding(.top, 16)
                    .padding(.bottom, 24)
                }
            }
            .padding(.horizontal, 24)
            .padding(.top, 16)

            MenuOverlayView(isVisible: $menuVisible, onPairGlasses: onConnectGlasses)
        }
    }

    private func settingsSection(title: String, @ViewBuilder content: () -> some View) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(AppTheme.textMuted)
                .tracking(0.5)
                .padding(.leading, 4)
            content()
        }
    }

    private func settingsRow(icon: String, label: String, showChevron: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 18))
                    .foregroundColor(.white)
                    .frame(width: 40, height: 40)
                    .background(AppTheme.gradient)
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                Text(label)
                    .font(.system(size: 16))
                    .foregroundColor(AppTheme.text)

                Spacer()

                if showChevron {
                    Image(systemName: "chevron.right")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(AppTheme.textMuted)
                }
            }
            .padding(16)
            .background(AppTheme.surface)
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
        .buttonStyle(.plain)
    }
}
