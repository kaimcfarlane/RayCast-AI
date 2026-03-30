/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import SwiftUI

struct CustomButton: View {
    let title: String
    let style: ButtonStyle
    let isDisabled: Bool
    let action: () -> Void

    enum ButtonStyle {
        case primary, secondary, destructive

        var backgroundColor: Color {
            switch self {
            case .primary:
                return .appPrimary
            case .secondary:
                return AppTheme.background
            case .destructive:
                return .destructiveBackground
            }
        }

        var foregroundColor: Color {
            switch self {
            case .primary, .secondary:
                return .white
            case .destructive:
                return .destructiveForeground
            }
        }
    }

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(style.foregroundColor)
                .frame(maxWidth: .infinity)
                .frame(height: 56)
                .background(style.backgroundColor)
                .cornerRadius(30)
                .overlay(
                    Group {
                        if style == .secondary {
                            RoundedRectangle(cornerRadius: 30)
                                .stroke(AppTheme.borderGradient, lineWidth: 2)
                        }
                    }
                )
        }
        .disabled(isDisabled)
        .opacity(isDisabled ? 0.6 : 1.0)
    }
}
