/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import MWDATCore
import SwiftUI

struct StreamSessionView: View {
    let wearables: WearablesInterface
    @ObservedObject private var wearablesViewModel: WearablesViewModel
    @StateObject private var viewModel: StreamSessionViewModel
    let taskMode: TaskMode?
    let searchQuery: String
    var onBackToHome: (() -> Void)?

    init(
        wearables: WearablesInterface,
        wearablesVM: WearablesViewModel,
        taskMode: TaskMode? = nil,
        searchQuery: String = "",
        onBackToHome: (() -> Void)? = nil
    ) {
        self.wearables = wearables
        self.wearablesViewModel = wearablesVM
        self.taskMode = taskMode
        self.searchQuery = searchQuery
        self.onBackToHome = onBackToHome
        self._viewModel = StateObject(wrappedValue: StreamSessionViewModel(wearables: wearables))
    }

    var body: some View {
        ZStack {
            if viewModel.isStreaming {
                StreamView(viewModel: viewModel, wearablesVM: wearablesViewModel, onBackToHome: onBackToHome)
            } else {
                NonStreamView(viewModel: viewModel, wearablesVM: wearablesViewModel, onBackToHome: onBackToHome)
            }
        }
        .onChange(of: taskMode) { _, newMode in
            viewModel.taskMode = newMode
        }
        .onChange(of: searchQuery) { _, newQuery in
            viewModel.searchQuery = newQuery
        }
        .onAppear {
            viewModel.taskMode = taskMode
            viewModel.searchQuery = searchQuery
        }
        .alert("Error", isPresented: $viewModel.showError) {
            Button("OK") {
                viewModel.dismissError()
            }
        } message: {
            Text(viewModel.errorMessage)
        }
    }
}
