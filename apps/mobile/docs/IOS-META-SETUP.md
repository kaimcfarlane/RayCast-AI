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

## What you should see when you tap “Start Pairing”

1. **Meta AI app opens** (not the home/chat screen).
2. **A connect/registration screen** — e.g. “Connect [RayCast AI]” or “Allow [RayCast AI] to connect to your glasses”, or a “Connected apps” / “Developer” screen where you can add or approve your app. Exact wording depends on the Meta AI app version.
3. **You approve** (e.g. “Connect” or “Allow”).
4. **You are sent back to RayCast AI** via the callback URL (`raycastai://` or your Universal Link). The app’s AppDelegate passes that URL to `Wearables.shared.handleUrl(url)` so registration completes.

If Meta AI opens to the **home screen** only, see “AppLinkURLScheme” below and ensure you rebuilt the app after changing it.

## AppLinkURLScheme (critical for pairing screen)

- In **Info.plist → MWDAT → AppLinkURLScheme** you must use your app’s **custom URL scheme** (e.g. `raycastai://`), not a Universal Link.
- The [official iOS build integration](https://wearables.developer.meta.com/docs/build-integration-ios/) and [sample app](https://github.com/facebook/meta-wearables-dat-ios/tree/main/samples) use a scheme like `myexampleapp://` or `cameraaccess://`.
- If you set `AppLinkURLScheme` to a Universal Link (e.g. `https://app.thelenslink.com`), Meta AI will open when you tap Pair but **stay on the home screen** instead of showing the “connect this app” / registration flow. Changing it to `raycastai://` fixes this.
- In the Wearables Developer Center, when you add your app, you can register the same callback (custom scheme or Universal Link) as needed for distribution; for the SDK handoff, `AppLinkURLScheme` in the app must be the custom scheme.

## Entitlements: two domains

- **applinks:thelenslink.com**
- **applinks:app.thelenslink.com**

Both are fine for Universal Links elsewhere. For MWDAT, use the custom scheme in `AppLinkURLScheme` as above.

## SDK usage in this app

- **AppDelegate.swift**: Uses `Wearables.configure()` and `Wearables.shared.handleUrl(url)` → only **import MWDATCore** is required. MWDATCamera is not used there.
- **WearablesModule.swift**: Uses registration and camera permission APIs → **import MWDATCore** and **import MWDATCamera** (as in the file).
- The SDK’s `startRegistration()` in 0.4.0 is **async**; we call it with `try await` inside `Task { @MainActor in ... }`. The docs’ sync `throws` example can be from an older SDK; our implementation matches the current API.

## Seeing [Wearables] / [MWDAT] logs

- **JS logs (Connect screen, startRegistration):** In the **Metro** terminal where you ran `pnpm start` or `npx expo start`. Look for `[Connect]` and `[Wearables]` (e.g. `[Connect] onStartPairing: calling startRegistration()...`, `[Wearables] startRegistration: calling native...`).
- **Native (Swift) logs:** When you run the app from **Xcode** (Run on your device, then View → Debug Area → Activate Console). Filter by `Wearables` or `MWDAT`. You’ll see e.g. `[Wearables] startRegistration called from JS`, then either success + fallback open logs or an error.
- **If you only use `pnpm run ios --device`:** Native logs are on the device. To see them on the Mac, run the app once from **Xcode** with the device selected, or use **Console.app** with the device connected and selected in the sidebar.

## Optional: registration state and devices stream

The SDK provides `registrationStateStream()` and `devicesStream()` for reactive updates. Exposing them to JS would require a native **event emitter** (e.g. RCTEventEmitter) that subscribes to those streams and sends events to React Native. Not implemented yet; can be added if you want live “Registered” / device list updates in the UI.
