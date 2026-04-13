import MWDATCore
import SwiftUI

struct SettingsView: View {
    @ObservedObject var wearablesVM: WearablesViewModel
    var onConnectGlasses: () -> Void
    @State private var menuVisible = false
    @ObservedObject private var historyStore = SessionHistoryStore.shared

    private var isConnected: Bool {
        wearablesVM.registrationState == .registered || wearablesVM.hasMockDevice
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

                VStack(alignment: .leading, spacing: 4) {
                    Text("Settings")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(AppTheme.text)
                    Text("Preferences & device")
                        .font(.system(size: 16))
                        .foregroundColor(AppTheme.textSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.bottom, 16)

                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 24) {
                        settingsSection(title: "DEVICE") {
                            if isConnected {
                                deviceSummaryCard
                            } else {
                                settingsRow(icon: "eyeglasses", label: "Connect glasses", showChevron: true) {
                                    onConnectGlasses()
                                }
                            }
                        }

                        settingsSection(title: "APP") {
                            VStack(spacing: 8) {
                                settingsRow(
                                    icon: "bell",
                                    label: "Notifications",
                                    showChevron: false,
                                    isDisabled: true
                                ) {}
                                settingsRow(
                                    icon: "lock.fill",
                                    label: "Privacy",
                                    showChevron: false,
                                    isDisabled: true
                                ) {}
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

            MenuOverlayView(
                isVisible: $menuVisible,
                onPairGlasses: onConnectGlasses,
                sessionHistory: historyStore.sessions
            )
        }
    }

    private var deviceSummaryCard: some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                Image(systemName: "eyeglasses")
                    .font(.system(size: 20))
                    .foregroundColor(.white)
                    .frame(width: 40, height: 40)
                    .background(AppTheme.gradient)
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                VStack(alignment: .leading, spacing: 3) {
                    Text("Meta Ray-Ban Gen 2")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(AppTheme.text)
                    HStack(spacing: 6) {
                        Circle()
                            .fill(.green)
                            .frame(width: 8, height: 8)
                        Text("Connected")
                            .font(.system(size: 14))
                            .foregroundColor(.green)
                    }
                }

                Spacer()
            }

            Divider()
                .background(AppTheme.border)

            Button(role: .destructive) {
                wearablesVM.disconnectGlasses()
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "wifi.slash")
                        .font(.system(size: 14))
                    Text("Disconnect")
                        .font(.system(size: 15, weight: .medium))
                }
                .foregroundColor(.red.opacity(0.85))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
            }
            .buttonStyle(.plain)
        }
        .padding(16)
        .background(AppTheme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 16))
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

    private func settingsRow(
        icon: String,
        label: String,
        showChevron: Bool,
        isDisabled: Bool = false,
        action: @escaping () -> Void
    ) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 18))
                    .foregroundColor(.white.opacity(isDisabled ? 0.4 : 1))
                    .frame(width: 40, height: 40)
                    .background(isDisabled ? AppTheme.surfaceElevated : nil)
                    .background(isDisabled ? nil : AppTheme.gradient)
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                Text(label)
                    .font(.system(size: 16))
                    .foregroundColor(isDisabled ? AppTheme.textMuted : AppTheme.text)

                Spacer()

                if isDisabled {
                    Text("Coming Soon")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(AppTheme.textMuted)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(AppTheme.surfaceElevated)
                        .clipShape(Capsule())
                } else if showChevron {
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
        .disabled(isDisabled)
    }
}
