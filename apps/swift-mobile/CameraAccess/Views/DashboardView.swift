import MWDATCore
import SwiftUI

enum TaskMode: String, CaseIterable, Identifiable {
    case chess, navigate, findObject, readText, describe, general

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .chess: return "square.grid.2x2"
        case .navigate: return "location"
        case .findObject: return "magnifyingglass"
        case .readText: return "book"
        case .describe: return "bubble.left"
        case .general: return "person.wave.2"
        }
    }

    var label: String {
        switch self {
        case .chess: return "Chess"
        case .navigate: return "Navigate"
        case .findObject: return "Find Object"
        case .readText: return "Read Text"
        case .describe: return "Describe"
        case .general: return "Talk"
        }
    }
}

struct DashboardView: View {
    @ObservedObject var wearablesVM: WearablesViewModel
    @Binding var selectedTask: TaskMode?
    @Binding var searchQuery: String
    var onStartSession: () -> Void
    @State private var menuVisible = false

    private var isConnected: Bool {
        wearablesVM.registrationState == .registered || wearablesVM.hasMockDevice
    }

    var body: some View {
        ZStack {
            AppTheme.background.ignoresSafeArea()

            VStack(spacing: 0) {
                headerRow
                titleSection

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 0) {
                        connectionCard
                            .padding(.bottom, 24)

                        Text("Select Task Mode")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(AppTheme.text)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.bottom, 16)

                        taskGrid
                            .padding(.bottom, 16)

                        if selectedTask == .findObject {
                            searchInputField
                                .padding(.bottom, 16)
                                .transition(.opacity.combined(with: .move(edge: .top)))
                        }

                        GradientButton(title: "Start Session", variant: .primary) {
                            let generator = UIImpactFeedbackGenerator(style: .medium)
                            generator.impactOccurred()
                            onStartSession()
                        }
                        .padding(.bottom, 24)
                    }
                    .padding(.top, 16)
                }
            }
            .padding(.horizontal, 24)
            .padding(.top, 16)

            MenuOverlayView(
                isVisible: $menuVisible,
                onStartLiveSession: onStartSession
            )
        }
    }

    private var headerRow: some View {
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
    }

    private var titleSection: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Dashboard")
                .font(.system(size: 32, weight: .bold))
                .foregroundColor(AppTheme.text)
            Text("Ready to assist")
                .font(.system(size: 16))
                .foregroundColor(AppTheme.textSecondary)
                .padding(.bottom, 16)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var connectionCard: some View {
        HStack(spacing: 12) {
            Image(systemName: isConnected ? "checkmark.circle.fill" : "xmark.circle.fill")
                .font(.system(size: 24))
                .foregroundColor(isConnected ? .green : .red)

            VStack(alignment: .leading, spacing: 4) {
                Text("Meta Ray-Ban Gen 2")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(AppTheme.text)
                Text(isConnected ? "Connected" : "Not connected")
                    .font(.system(size: 14))
                    .foregroundColor(AppTheme.textSecondary)
            }

            Spacer()
        }
        .padding(16)
        .background(AppTheme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var searchInputField: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("What are you looking for?")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(AppTheme.textSecondary)

            TextField("e.g. my keys, a red bag, the exit sign...", text: $searchQuery)
                .font(.system(size: 16))
                .foregroundColor(AppTheme.text)
                .padding(14)
                .background(AppTheme.surface)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(AppTheme.border, lineWidth: 1)
                )
        }
        .animation(.easeInOut(duration: 0.2), value: selectedTask)
    }

    private var taskGrid: some View {
        let modes = TaskMode.allCases
        return VStack(spacing: 12) {
            ForEach(0..<3) { row in
                HStack(spacing: 12) {
                    ForEach(0..<2) { col in
                        let index = row * 2 + col
                        if index < modes.count {
                            TaskCardView(
                                icon: modes[index].icon,
                                label: modes[index].label,
                                isSelected: selectedTask == modes[index]
                            ) {
                                selectedTask = modes[index]
                            }
                        }
                    }
                }
            }
        }
    }
}
