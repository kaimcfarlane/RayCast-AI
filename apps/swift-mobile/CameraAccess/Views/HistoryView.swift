import SwiftUI

struct HistoryView: View {
    @State private var menuVisible = false
    @ObservedObject private var historyStore = SessionHistoryStore.shared
    @State private var expandedSessionId: String?

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

                    if !historyStore.sessions.isEmpty {
                        Button(action: { historyStore.clearAll() }) {
                            Text("Clear All")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(AppTheme.textMuted)
                        }
                    }
                }
                .padding(.bottom, 24)

                VStack(alignment: .leading, spacing: 4) {
                    Text("History")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(AppTheme.text)
                    Text("Past sessions")
                        .font(.system(size: 16))
                        .foregroundColor(AppTheme.textSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.bottom, 16)

                if historyStore.sessions.isEmpty {
                    Spacer()
                    emptyState
                    Spacer()
                } else {
                    sessionList
                }
            }
            .padding(.horizontal, 24)
            .padding(.top, 16)

            MenuOverlayView(
                isVisible: $menuVisible,
                sessionHistory: historyStore.sessions
            )
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "clock")
                .font(.system(size: 52))
                .foregroundColor(AppTheme.textMuted)
            Text("No sessions yet")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(AppTheme.text)
            Text("Your session history will appear here once you start using RayCast AI.")
                .font(.system(size: 15))
                .foregroundColor(AppTheme.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)
                .lineSpacing(4)
        }
    }

    private var sessionList: some View {
        ScrollView(showsIndicators: false) {
            LazyVStack(spacing: 12) {
                ForEach(historyStore.sessions) { session in
                    SessionCardView(
                        session: session,
                        isExpanded: expandedSessionId == session.id,
                        onTap: {
                            withAnimation(.easeInOut(duration: 0.25)) {
                                expandedSessionId = expandedSessionId == session.id ? nil : session.id
                            }
                        },
                        onDelete: {
                            withAnimation { historyStore.deleteSession(id: session.id) }
                        }
                    )
                }
            }
            .padding(.bottom, 24)
        }
    }
}

private struct SessionCardView: View {
    let session: SessionRecord
    let isExpanded: Bool
    var onTap: () -> Void
    var onDelete: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button(action: onTap) {
                HStack(spacing: 12) {
                    Image(systemName: session.taskMode.icon)
                        .font(.system(size: 16))
                        .foregroundColor(.white)
                        .frame(width: 40, height: 40)
                        .background(AppTheme.gradient)
                        .clipShape(RoundedRectangle(cornerRadius: 12))

                    VStack(alignment: .leading, spacing: 3) {
                        Text(session.taskMode.label)
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(AppTheme.text)
                        HStack(spacing: 8) {
                            Text(session.formattedDate)
                            Text("·")
                            Text("\(session.messageCount) messages")
                            Text("·")
                            Text(session.duration)
                        }
                        .font(.system(size: 13))
                        .foregroundColor(AppTheme.textMuted)
                    }

                    Spacer()

                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(AppTheme.textMuted)
                }
            }
            .buttonStyle(.plain)
            .padding(16)

            if isExpanded {
                Divider()
                    .background(AppTheme.border)

                VStack(alignment: .leading, spacing: 8) {
                    ForEach(session.messages) { msg in
                        HStack(alignment: .top, spacing: 8) {
                            Image(systemName: msg.isUser ? "person.fill" : "brain.head.profile")
                                .font(.system(size: 11))
                                .foregroundColor(msg.isUser ? AppTheme.gradientEnd : AppTheme.textMuted)
                                .frame(width: 20)

                            Text(msg.text)
                                .font(.system(size: 13))
                                .foregroundColor(AppTheme.textSecondary)
                                .lineLimit(3)
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)

                HStack {
                    Spacer()
                    Button(action: onDelete) {
                        HStack(spacing: 4) {
                            Image(systemName: "trash")
                                .font(.system(size: 12))
                            Text("Delete")
                                .font(.system(size: 13, weight: .medium))
                        }
                        .foregroundColor(.red.opacity(0.8))
                    }
                    .buttonStyle(.plain)
                    .padding(.trailing, 16)
                    .padding(.bottom, 12)
                }
            }
        }
        .background(AppTheme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}
