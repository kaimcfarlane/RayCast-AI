/**
 * Backend API base URL for the RayCast AI perception pipeline.
 * - iOS Simulator: localhost works
 * - Android Emulator: use 10.0.2.2 to reach host machine
 * - Physical device: use your machine's LAN IP (e.g. 192.168.1.x)
 */
import { Platform } from 'react-native';

const LAN_IP = process.env.EXPO_PUBLIC_LAN_IP ?? '127.0.0.1';
const BASE_URL_OVERRIDE = process.env.EXPO_PUBLIC_RAYCAST_API_BASE_URL;

const getDefaultBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8001';
    }
    return `http://${LAN_IP}:8001`;
  }
  return `http://${LAN_IP}:8001`;
};

export const API_BASE_URL = BASE_URL_OVERRIDE ?? getDefaultBaseUrl();
