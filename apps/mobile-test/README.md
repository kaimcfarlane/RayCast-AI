# Meta Camera Access sample (mobile-test)

This is the **official Meta Wearables sample app** ([CameraAccess](https://github.com/facebook/meta-wearables-dat-ios/tree/main/samples/CameraAccess)) copied here so you can run it and compare Connect/registration behavior with the main RayCast AI app.

## Quick start

1. **Open in Xcode**
   - Open `apps/mobile-test/CameraAccess.xcodeproj` in Xcode (use the `.xcodeproj`, not the inner `CameraAccess` folder).

2. **Select your device**
   - Choose your physical iPhone in the scheme/device dropdown (the sample uses the Wearables SDK; simulator may not be enough for full flow).

3. **Run**
   - Press **Run** (▶️) or `Cmd+R`. Xcode will resolve the Swift package dependency (`meta-wearables-dat-ios`) from GitHub.

4. **Connect**
   - In the app, turn on **Developer Mode** in the Meta AI app first, then tap **Connect** in this sample to see how Meta’s sample handles registration and how Meta AI should open (e.g. to the connect screen).

## Developer Mode

- With **Developer Mode** on in the Meta AI app, you can run without setting `META_APP_ID` / `CLIENT_TOKEN` in Xcode (the sample uses `$(META_APP_ID)` and `$(CLIENT_TOKEN)`; leave them empty or set in Build Settings if you have values from the [Wearables Developer Center](https://wearables.developer.meta.com/)).

## Why this is here

- Compare how **Connect** works in this sample vs. the Expo/React Native app in `apps/mobile`.
- The sample uses `AppLinkURLScheme`: `cameraaccess://` (see `CameraAccess/Info.plist` → MWDAT).
- Callbacks from Meta AI are handled in `CameraAccess/Views/RegistrationView.swift` via `onOpenURL` and `Wearables.shared.handleUrl(url)`.

## Source

- Cloned from: [facebook/meta-wearables-dat-ios – samples/CameraAccess](https://github.com/facebook/meta-wearables-dat-ios/tree/main/samples/CameraAccess)
- Meta docs: [Wearables Developer Center](https://wearables.developer.meta.com/docs/develop/)

---

The rest of this file is Meta’s original README for the sample.

---

# Camera Access App

A sample iOS application demonstrating integration with Meta Wearables Device Access Toolkit. This app showcases streaming video from Meta AI glasses, capturing photos, and managing connection states.

## Features

- Connect to Meta AI glasses
- Stream camera feed from the device
- Capture photos from glasses
- Share captured photos

## Prerequisites

- iOS 17.0+
- Xcode 14.0+
- Swift 5.0+
- Meta Wearables Device Access Toolkit (included as a dependency)
- A Meta AI glasses device for testing (optional for development)

## Building the app

### Using Xcode

1. Clone this repository
1. Open the project in Xcode
1. Select your target device
1. Click the "Build" button or press `Cmd+B` to build the project
1. To run the app, click the "Run" button (▶️) or press `Cmd+R`

## Running the app

1. Turn 'Developer Mode' on in the Meta AI app.
1. Launch the app.
1. Press the "Connect" button to complete app registration.
1. Once connected, the camera stream from the device will be displayed
1. Use the on-screen controls to:
   - Capture photos
   - View and save captured photos
   - Disconnect from the device

## Troubleshooting

For issues related to the Meta Wearables Device Access Toolkit, please refer to the [developer documentation](https://wearables.developer.meta.com/docs/develop/) or visit our [discussions forum](https://github.com/facebook/meta-wearables-dat-ios/discussions)

## License

This source code is licensed under the license found in the LICENSE file in the root directory of this source tree.
