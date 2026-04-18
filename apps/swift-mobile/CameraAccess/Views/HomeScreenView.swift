//
// HomeScreenView.swift (swift-mobile)
// RayCast AI–style Connect screen: gradient header, setup steps, Connect my glasses.
// Same flow as mobile-test; uses WearablesViewModel.connectGlasses().
//

import MWDATCore
import SwiftUI

struct HomeScreenView: View {
  @ObservedObject var viewModel: WearablesViewModel

  private let gradientColors: [Color] = [
    Color(red: 0.2, green: 0.4, blue: 0.9),
    Color(red: 0.4, green: 0.2, blue: 0.8)
  ]

  var body: some View {
    VStack(spacing: 0) {
      // Gradient header (RayCast AI style)
      VStack(alignment: .leading, spacing: 8) {
        Text("Connect Glasses")
          .font(.system(size: 32, weight: .bold))
          .foregroundColor(.white)
        Text("Pair your Meta Ray-Ban")
          .font(.system(size: 16))
          .foregroundColor(.white.opacity(0.9))
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      .padding(.horizontal, 24)
      .padding(.top, 24)
      .padding(.bottom, 32)
      .background(
        LinearGradient(
          colors: gradientColors,
          startPoint: .leading,
          endPoint: .trailing
        )
      )

      ScrollView {
        VStack(alignment: .leading, spacing: 20) {
          // Status card
          VStack(spacing: 16) {
            Image(systemName: "eyeglasses")
              .font(.system(size: 60))
              .foregroundColor(.gray.opacity(0.6))
            Text(
              viewModel.registrationState == .registering
                ? "Connecting… Complete the connection in the Meta AI app, then return here."
                : "You'll be redirected to the Meta AI app to confirm your connection."
            )
            .font(.system(size: 16))
            .foregroundColor(.secondary)
            .multilineTextAlignment(.center)
          }
          .frame(maxWidth: .infinity)
          .padding(32)
          .background(Color(.systemGray6))
          .cornerRadius(16)

          // Connection status
          HStack(spacing: 12) {
            Image(systemName: "xmark.circle.fill")
              .foregroundColor(.red)
            VStack(alignment: .leading, spacing: 2) {
              Text("Connection Status")
                .font(.system(size: 14))
                .foregroundColor(.secondary)
              Text("Not Connected")
                .font(.system(size: 16, weight: .semibold))
            }
            Spacer()
          }
          .padding(16)
          .background(Color(.systemGray6))
          .cornerRadius(12)

          // Setup steps (RayCast AI copy)
          VStack(alignment: .leading, spacing: 16) {
            Text("Setup Steps")
              .font(.system(size: 18, weight: .semibold))
            VStack(alignment: .leading, spacing: 8) {
              stepRow("1. In Meta AI app: turn on Developer Mode (Profile → Settings → Developer mode)")
              stepRow("2. Turn on your glasses and enable Bluetooth")
              stepRow("3. Tap \"Connect my glasses\" — approve connecting RayCast AI in Meta AI if prompted")
              stepRow("4. Return to this app after authorizing")
              Text("If Meta AI opens to the home screen: open Menu → Device settings and look for \"Connected apps\" or \"Developer\" to add or approve RayCast AI.")
                .font(.system(size: 13))
                .foregroundColor(.secondary)
                .italic()
            }
          }
          .padding(20)
          .background(Color(.systemGray6))
          .cornerRadius(16)

          // Connect button
          CustomButton(
            title: viewModel.registrationState == .registering ? "Connecting..." : "Connect my glasses",
            style: .primary,
            isDisabled: viewModel.registrationState == .registering
          ) {
            viewModel.connectGlasses()
          }
          .padding(.top, 8)

          // Skip (optional - just for parity with RN; can go to stream view when registered)
          Button("Skip for Now") {
            // No-op; when registered, MainAppView shows StreamSessionView
          }
          .font(.system(size: 15, weight: .medium))
          .foregroundColor(.accentColor)
          .frame(maxWidth: .infinity)
          .padding(.vertical, 16)
        }
        .padding(24)
      }
      .background(Color(.systemBackground))
    }
    .background(Color(.systemBackground))
  }

  private func stepRow(_ text: String) -> some View {
    Text(text)
      .font(.system(size: 15))
      .foregroundColor(.primary.opacity(0.85))
  }
}
