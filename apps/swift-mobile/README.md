# Swift-only RayCast AI (swift-mobile)

Pure Swift/iOS app that **simulates the RayCast AI Connect flow** using the same Meta Wearables setup as `mobile-test`, but with **your bundle ID** (`com.thelenslink.raycastai`) and **your team** (Q22VU5W4JW). Use this to confirm that the Connect/registration flow works with your bundle ID when there is no React Native/Expo in the stack.

## What this app is

- **Based on:** Meta’s CameraAccess sample (same structure as `apps/mobile-test`).
- **UI:** RayCast AI–style Connect screen: gradient header (“Connect Glasses” / “Pair your Meta Ray-Ban”), status card, setup steps, “Connect my glasses” button.
- **SDK flow:** `Wearables.configure()` at launch, `startRegistration()` on button tap, `handleUrl` for callbacks (only URLs with `metaWearablesAction`).
- **Your config:** Bundle ID `com.thelenslink.raycastai`, URL scheme `raycastai://`, MetaAppID and ClientToken from your Wearables Developer Center project, team Q22VU5W4JW.

## How to run

1. Open **`apps/swift-mobile/CameraAccess.xcodeproj`** in Xcode. The **target** and **scheme** are **RayCastAI** (select the RayCastAI scheme).
2. Select your **team** (Signing & Capabilities) and a **physical device**.
3. Build and run (▶️).
4. Turn on **Developer Mode** in the Meta AI app, then in this app tap **“Connect my glasses”**.

If Meta AI opens to the connect screen and the callback returns to this app, the same setup is valid for your bundle ID and the issue is likely in the React Native/Expo app.

## Project layout

- **CameraAccess/** – Source folder. Target name: **RayCastAI** (display name “RayCast AI”).
- **CameraAccess/Info.plist** – `raycastai` URL scheme, MWDAT with `raycastai://`, your MetaAppID/ClientToken.
- **CameraAccess/Views/HomeScreenView.swift** – RayCast-style Connect UI.
- **CameraAccess/Views/RegistrationView.swift** – Handles `raycastai://` callbacks with `metaWearablesAction`.
- **CameraAccess/ViewModels/WearablesViewModel.swift** – `connectGlasses()` → `startRegistration()` (same as mobile-test).
- **CameraAccessTests/** – Test target; bundle ID `com.thelenslink.raycastai.tests`.

## Reverting to Meta’s sample bundle ID (optional)

To compare with `mobile-test`, you can set the app’s bundle ID back to `com.meta.wearables.external.CameraAccess` in the Xcode project (Signing & Capabilities or `project.pbxproj`). You cannot use that bundle ID if it’s already registered to another team.
