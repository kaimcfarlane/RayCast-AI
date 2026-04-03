import MWDATCore
import SwiftUI

enum AppTab: String, CaseIterable {
    case home, live, history, settings
}

struct RootTabView: View {
    let wearables: WearablesInterface
    @ObservedObject var wearablesVM: WearablesViewModel
    @Binding var selectedTab: AppTab
    var onNavigateToConnect: () -> Void
    @State private var selectedTask: TaskMode? = nil

    var body: some View {
        TabView(selection: $selectedTab) {
            DashboardView(wearablesVM: wearablesVM, selectedTask: $selectedTask) {
                selectedTab = .live
            }
            .tabItem {
                Label("Home", systemImage: selectedTab == .home ? "house.fill" : "house")
            }
            .tag(AppTab.home)

            StreamSessionView(
                wearables: wearables,
                wearablesVM: wearablesVM,
                taskMode: selectedTask,
                onBackToHome: { selectedTab = .home }
            )
            .tabItem {
                Label("Live", systemImage: selectedTab == .live ? "video.fill" : "video")
            }
            .tag(AppTab.live)

            HistoryView()
                .tabItem {
                    Label("History", systemImage: selectedTab == .history ? "clock.fill" : "clock")
                }
                .tag(AppTab.history)

            SettingsView(onConnectGlasses: onNavigateToConnect)
                .tabItem {
                    Label("Settings", systemImage: selectedTab == .settings ? "gearshape.fill" : "gearshape")
                }
                .tag(AppTab.settings)
        }
        .tint(AppTheme.gradientEnd)
        .onAppear { configureTabBarAppearance() }
    }

    private func configureTabBarAppearance() {
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(AppTheme.surface)

        let borderColor = UIColor(AppTheme.border)
        appearance.shadowImage = UIImage()
        appearance.shadowColor = borderColor

        let normalAttributes: [NSAttributedString.Key: Any] = [
            .foregroundColor: UIColor(AppTheme.tabInactive),
            .font: UIFont.systemFont(ofSize: 11, weight: .medium)
        ]
        let selectedAttributes: [NSAttributedString.Key: Any] = [
            .foregroundColor: UIColor(AppTheme.gradientEnd),
            .font: UIFont.systemFont(ofSize: 11, weight: .medium)
        ]

        appearance.stackedLayoutAppearance.normal.titleTextAttributes = normalAttributes
        appearance.stackedLayoutAppearance.selected.titleTextAttributes = selectedAttributes
        appearance.stackedLayoutAppearance.normal.iconColor = UIColor(AppTheme.tabInactive)
        appearance.stackedLayoutAppearance.selected.iconColor = UIColor(AppTheme.gradientEnd)

        UITabBar.appearance().standardAppearance = appearance
        UITabBar.appearance().scrollEdgeAppearance = appearance
    }
}
