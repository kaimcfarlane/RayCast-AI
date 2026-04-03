import SwiftUI

struct HistoryView: View {
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
                    Text("History")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(AppTheme.text)
                    Text("Past sessions")
                        .font(.system(size: 16))
                        .foregroundColor(AppTheme.textSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.bottom, 16)

                Spacer()

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

                Spacer()
            }
            .padding(.horizontal, 24)
            .padding(.top, 16)

            MenuOverlayView(isVisible: $menuVisible)
        }
    }
}
