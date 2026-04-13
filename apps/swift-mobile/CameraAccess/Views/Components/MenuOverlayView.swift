import SwiftUI

struct MenuOverlayView: View {
    @Binding var isVisible: Bool
    var onPairGlasses: () -> Void = {}
    var onStartLiveSession: () -> Void = {}
    var sessionHistory: [SessionRecord] = []

    @State private var dragOffset: CGFloat = 0
    @State private var openDragOffset: CGFloat = 0

    private let drawerWidth: CGFloat = UIScreen.main.bounds.width * 0.8
    private let edgeSwipeWidth: CGFloat = 24

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
                    .offset(x: isVisible ? dragOffset : -drawerWidth + max(0, openDragOffset))
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

            if !isVisible {
                HStack {
                    Color.clear
                        .frame(width: edgeSwipeWidth)
                        .contentShape(Rectangle())
                        .gesture(
                            DragGesture()
                                .onChanged { value in
                                    if value.startLocation.x < edgeSwipeWidth && value.translation.width > 0 {
                                        openDragOffset = min(value.translation.width, drawerWidth)
                                    }
                                }
                                .onEnded { value in
                                    if value.translation.width > 80 {
                                        open()
                                    }
                                    withAnimation(.easeOut(duration: 0.2)) {
                                        openDragOffset = 0
                                    }
                                }
                        )
                    Spacer()
                }
                .ignoresSafeArea()
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
            }

            historySection
                .padding(.top, 48)
                .overlay(
                    Rectangle()
                        .frame(height: 1)
                        .foregroundColor(AppTheme.border),
                    alignment: .top
                )
                .padding(.top, 48)

            Spacer()
        }
        .padding(.horizontal, 24)
        .padding(.top, 60)
        .padding(.bottom, 40)
    }

    private var historySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("RECENT SESSIONS")
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(AppTheme.textMuted)
                .tracking(0.5)

            if sessionHistory.isEmpty {
                Text("No sessions yet.\nStart a live session to see history here.")
                    .font(.system(size: 14))
                    .foregroundColor(AppTheme.textSecondary)
                    .lineSpacing(4)
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(sessionHistory.prefix(5)) { session in
                        SessionRowView(session: session)
                    }
                }
            }
        }
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

    private func open() {
        withAnimation(.easeInOut(duration: 0.25)) {
            isVisible = true
        }
    }
}

private struct SessionRowView: View {
    let session: SessionRecord

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: session.taskMode.icon)
                .font(.system(size: 14))
                .foregroundColor(AppTheme.textSecondary)
                .frame(width: 28, height: 28)
                .background(AppTheme.surfaceElevated)
                .clipShape(Circle())

            VStack(alignment: .leading, spacing: 2) {
                Text(session.taskMode.label)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(AppTheme.text)
                Text(session.formattedDate)
                    .font(.system(size: 12))
                    .foregroundColor(AppTheme.textMuted)
            }

            Spacer()

            Text("\(session.messageCount) msgs")
                .font(.system(size: 12))
                .foregroundColor(AppTheme.textMuted)
        }
        .padding(.vertical, 6)
    }
}
