import MWDATCore
import SwiftUI

enum AppScreen {
    case welcome
    case connect
    case tabs
}

struct MainAppView: View {
    let wearables: WearablesInterface
    @ObservedObject private var viewModel: WearablesViewModel
    @AppStorage("hasCompletedOnboarding") private var hasCompletedOnboarding = false
    @State private var currentScreen: AppScreen = .welcome
    @State private var selectedTab: AppTab = .home

    @State private var cameFromSettings = false

    init(wearables: WearablesInterface, viewModel: WearablesViewModel) {
        self.wearables = wearables
        self.viewModel = viewModel
    }

    var body: some View {
        Group {
            switch currentScreen {
            case .welcome:
                WelcomeView {
                    withAnimation { currentScreen = .connect }
                }
            case .connect:
                ConnectView(
                    viewModel: viewModel,
                    onSkip: {
                        hasCompletedOnboarding = true
                        withAnimation { currentScreen = .tabs }
                    },
                    onBack: cameFromSettings ? {
                        withAnimation {
                            currentScreen = .tabs
                            selectedTab = .settings
                            cameFromSettings = false
                        }
                    } : nil
                )
            case .tabs:
                RootTabView(
                    wearables: wearables,
                    wearablesVM: viewModel,
                    selectedTab: $selectedTab,
                    onNavigateToConnect: {
                        cameFromSettings = true
                        withAnimation { currentScreen = .connect }
                    }
                )
            }
        }
        .onAppear {
            if hasCompletedOnboarding || viewModel.registrationState == .registered {
                currentScreen = .tabs
            } else {
                currentScreen = .welcome
            }
        }
        .onChange(of: viewModel.registrationState) { oldState, newState in
            if newState == .registered && currentScreen == .connect {
                hasCompletedOnboarding = true
                let tab: AppTab = cameFromSettings ? .settings : .live
                cameFromSettings = false
                withAnimation {
                    currentScreen = .tabs
                    selectedTab = tab
                }
            }
        }
    }
}
