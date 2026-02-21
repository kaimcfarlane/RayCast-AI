import { NativeModules, Platform } from 'react-native';

const WearablesModule = NativeModules.WearablesModule as
  | {
      startRegistration: () => Promise<void>;
      requestCameraPermission: () => Promise<string>;
    }
  | undefined;

const isIOS = Platform.OS === 'ios';

/**
 * Start registration with the Meta AI app. On iOS this opens Meta AI so the user
 * can authorize this app for wearables. Callback URL (raycastai://) returns to the app.
 * Rejects if Meta AI cannot be opened (e.g. app not installed).
 */
export function startRegistration(): Promise<void> {
  if (!isIOS || !WearablesModule) {
    return Promise.reject(new Error('Wearables not available'));
  }
  return WearablesModule.startRegistration();
}

/**
 * Request camera permission (required before starting a camera stream from glasses).
 * Returns permission status string, e.g. 'authorized' | 'denied' | etc.
 */
export function requestCameraPermission(): Promise<string> {
  if (!isIOS || !WearablesModule) {
    return Promise.resolve('unavailable');
  }
  return WearablesModule.requestCameraPermission();
}

export const wearablesAvailable = isIOS && !!WearablesModule;
