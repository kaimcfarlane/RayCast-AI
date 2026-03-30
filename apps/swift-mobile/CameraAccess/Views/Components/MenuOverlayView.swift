import SwiftUI

struct MenuOverlayView: View {
    @Binding var isVisible: Bool
    var onPairGlasses: () -> Void = {}
    var onStartLiveSession: () -> Void = {}

    @State private var dragOffset: CGFloat = 0

    private let drawerWidth: CGFloat = UIScreen.main.bounds.width * 0.8

    var body: some View {
        ZStack {
            if isVisible {
                Color.black.opacity(0.5)
                    .ignoresSafeArea()
                    .onTapGesture { close() }
                    .transition(.opacity)
            }

            HStack(spacing: 0) {
                drawerContent
                    .frame(width: drawerWidth)
                    .background(AppTheme.background)
                    .overlay(
                        Rectangle()
                            .frame(width: 1)
                            .foregroundColor(AppTheme.border),
                        alignment: .trailing
                    )
                    .offset(x: isVisible ? dragOffset : -drawerWidth)
                    .gesture(
                        DragGesture()
                            .onChanged { value in
                                if value.translation.width < 0 {
                                    dragOffset = value.translation.width
                                }
                            }
                            .onEnded { value in
                                if value.translation.width < -80 {
                                    close()
                                }
                                dragOffset = 0
                            }
                    )

                Spacer()
            }
        }
        .animation(.easeInOut(duration: 0.3), value: isVisible)
    }

    private var drawerContent: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Spacer()
                Button(action: { close() }) {
                    Image(systemName: "xmark")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(width: 40, height: 40)
                        .background(AppTheme.surface)
                        .clipShape(Circle())
                }
            }
            .padding(.bottom, 32)

            VStack(alignment: .leading, spacing: 28) {
                menuItem(icon: "eyeglasses", label: "Pair Meta Glasses", action: {
                    close()
                    onPairGlasses()
                })
                menuItem(icon: "video", label: "Start Live Session", action: {
                    close()
                    onStartLiveSession()
                })
                menuItem(icon: "bell", label: "Notifications", action: {})
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("HISTORY")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(AppTheme.textMuted)
                    .tracking(0.5)
                Text("You currently don't have any\nsessions with RayCast")
                    .font(.system(size: 15))
                    .foregroundColor(AppTheme.textSecondary)
                    .lineSpacing(4)
            }
            .padding(.top, 48)
            .overlay(
                Rectangle()
                    .frame(height: 1)
                    .foregroundColor(AppTheme.border),
                alignment: .top
            )
            .padding(.top, 48)

            Spacer()

            HStack(spacing: 12) {
                Circle()
                    .fill(Color.white)
                    .frame(width: 44, height: 44)
                    .overlay(
                        Image(systemName: "person.fill")
                            .font(.system(size: 20))
                            .foregroundColor(.black)
                    )
                Text("User Account")
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundColor(.white)
            }
            .padding(.top, 24)
            .overlay(
                Rectangle()
                    .frame(height: 1)
                    .foregroundColor(AppTheme.border),
                alignment: .top
            )
        }
        .padding(.horizontal, 24)
        .padding(.top, 60)
        .padding(.bottom, 40)
    }

    private func menuItem(icon: String, label: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(.white)
                    .frame(width: 32)
                Text(label)
                    .font(.system(size: 17, weight: .medium))
                    .foregroundColor(.white)
            }
        }
        .buttonStyle(.plain)
    }

    private func close() {
        withAnimation(.easeInOut(duration: 0.25)) {
            isVisible = false
        }
    }
}
