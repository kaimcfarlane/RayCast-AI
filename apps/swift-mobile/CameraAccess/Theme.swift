import SwiftUI

enum AppTheme {
    static let background = Color(red: 0.102, green: 0.102, blue: 0.180)       // #1A1A2E
    static let surface = Color(red: 0.145, green: 0.145, blue: 0.251)          // #252540
    static let surfaceElevated = Color(red: 0.176, green: 0.176, blue: 0.290)  // #2D2D4A
    static let border = Color(red: 0.227, green: 0.227, blue: 0.361)           // #3A3A5C
    static let text = Color.white
    static let textSecondary = Color(red: 0.627, green: 0.627, blue: 0.722)    // #A0A0B8
    static let textMuted = Color(red: 0.420, green: 0.420, blue: 0.553)        // #6B6B8D
    static let menuIconBg = Color(red: 0.200, green: 0.200, blue: 0.333)       // #333355

    static let gradientStart = Color(red: 0.310, green: 0.275, blue: 0.898)    // #4F46E5
    static let gradientEnd = Color(red: 0.576, green: 0.200, blue: 0.918)      // #9333EA
    static let gradientBorderEnd = Color(red: 0.851, green: 0.275, blue: 0.937) // #D946EF

    static let gradient = LinearGradient(
        colors: [gradientStart, gradientEnd],
        startPoint: .leading,
        endPoint: .trailing
    )

    static let diagonalGradient = LinearGradient(
        colors: [gradientStart, gradientEnd],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let borderGradient = LinearGradient(
        colors: [gradientStart, gradientEnd, gradientBorderEnd],
        startPoint: .leading,
        endPoint: .trailing
    )

    static let tabInactive = Color(red: 0.420, green: 0.420, blue: 0.553) // same as textMuted
}
