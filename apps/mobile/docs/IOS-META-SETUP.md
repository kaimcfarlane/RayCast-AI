# iOS + Meta Wearables setup

## Official SDK docs (0.4.0)

- **GitHub repo:** [facebook/meta-wearables-dat-ios](https://github.com/facebook/meta-wearables-dat-ios)
- **Wearables Developer Center (overview, setup, manage projects):** [wearables.developer.meta.com](https://wearables.developer.meta.com/)
- **iOS API reference for 0.4:** [Reference – iOS Swift DAT 0.4](https://wearables.developer.meta.com/docs/reference/ios_swift/dat/0.4) — types, `Wearables`, `startRegistration`, `handleUrl`, streams, etc.
- **Build integration (iOS):** [Build integration – iOS](https://wearables.developer.meta.com/docs/build-integration-ios/)

## When do native changes take effect?

- **Swift / Objective-C / Info.plist**: Only when you **rebuild the native app**. Run:
  ```bash
  npx expo run:ios --device
  ```
  or build from Xcode. **Metro (`npx expo start`) only serves JS** — it does not recompile native code.
- **Pod install**: Only needed if you change `Podfile` or add/remove pods. Swift file edits do **not** require `pod install`.
- **Restart Metro**: Not required for native changes. Restart only if you change JS/TS and something seems stuck.

## Swift package version (meta-wearables-dat-ios)

- Your dependency: **Up to Next Major Version** from **0.4.0** (i.e. `0.4.0` .. `< 1.0.0`) is correct.
- Resolved version in this project: **0.4.0** (see `ios/RayCastAI.xcworkspace/xcshareddata/swiftpm/Package.resolved`).
- Meta’s “0.40.3 or 0.2.1” in docs is likely a typo for **0.4.0** / 0.4.x. The repo’s current release is 0.4.0. No change needed.

## Xcode: "No such module 'Expo'" / module map not found

If Xcode shows **No such module 'Expo'** or many **module map file ... not found** (EXConstants, Expo, etc.):

1. **Always open the workspace, not the project:** Open `ios/RayCastAI.xcworkspace` (double‑click it in Finder or File → Open in Xcode). Do **not** open `RayCastAI.xcodeproj` when you want to build or run — the workspace includes CocoaPods and Expo modules.
2. **Install Pods:** In Terminal:
   ```bash
   cd apps/mobile/ios
   pod install
   ```
3. **Clean and reset build cache:**
   - In Xcode: **Product → Clean Build Folder** (Shift+Cmd+K).
   - Optional (if it still fails): quit Xcode and delete this app’s DerivedData:
     ```bash
     rm -rf ~/Library/Developer/Xcode/DerivedData/RayCastAI-*
     ```
   Then open `RayCastAI.xcworkspace` again and build (Cmd+B).
4. **Scheme and device:** Select the **RayCastAI** scheme and your physical device (or a simulator), then Run.

## Xcode: red lines in WearablesModuleBridge.m

- `#import <React/RCTBridgeModule.h>` can show red in the editor if Xcode hasn’t indexed Pods.
- **Always open** `ios/RayCastAI.xcworkspace` (not the `.xcodeproj`).
- Build once (Cmd+B). If the app builds and runs, the red is cosmetic; the build has the right paths.

## Entitlements: two domains

- **applinks:thelenslink.com**
- **applinks:app.thelenslink.com**

Both are fine. Meta’s callback uses `https://app.thelenslink.com`, so the second is the one used for Universal Links. Keeping both does not cause problems.

## SDK usage in this app

- **AppDelegate.swift**: Uses `Wearables.configure()` and `Wearables.shared.handleUrl(url)` → only **import MWDATCore** is required. MWDATCamera is not used there.
- **WearablesModule.swift**: Uses registration and camera permission APIs → **import MWDATCore** and **import MWDATCamera** (as in the file).
- The SDK’s `startRegistration()` in 0.4.0 is **async**; we call it with `try await` inside `Task { @MainActor in ... }`. The docs’ sync `throws` example can be from an older SDK; our implementation matches the current API.

## Seeing [Wearables] / [MWDAT] logs

- **When you run from Xcode:** Device logs appear in the **Xcode console** (View → Debug Area → Activate Console). Filter by `Wearables` or `MWDAT`. The Mac **Console.app** only shows logs for processes on the Mac, not for the app running on the device.
- **When you run with `npx expo run:ios --device`:** The app runs on the phone; logs are on the **device**. To see them on the Mac, run the app from **Xcode** with the device selected (so Xcode streams the device log), or use **Console.app** with the device connected and selected in the sidebar, or run `xcrun devicectl device info logs --device <udid>` in Terminal.

## Optional: registration state and devices stream

The SDK provides `registrationStateStream()` and `devicesStream()` for reactive updates. Exposing them to JS would require a native **event emitter** (e.g. RCTEventEmitter) that subscribes to those streams and sends events to React Native. Not implemented yet; can be added if you want live “Registered” / device list updates in the UI.
