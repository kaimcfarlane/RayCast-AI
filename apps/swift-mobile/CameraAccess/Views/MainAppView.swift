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
                ConnectView(viewModel: viewModel) {
                    hasCompletedOnboarding = true
                    withAnimation { currentScreen = .tabs }
                }
            case .tabs:
                RootTabView(
                    wearables: wearables,
                    wearablesVM: viewModel,
                    selectedTab: $selectedTab,
                    onNavigateToConnect: {
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
                withAnimation {
                    currentScreen = .tabs
                    selectedTab = .live
                }
            }
        }
    }
}
