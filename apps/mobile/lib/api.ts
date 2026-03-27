/**
 * API client for the RayCast AI backend (perception pipeline).
 * Endpoints: GET /mock, GET /health, POST /analyze-video
 */
import { API_BASE_URL } from '@/constants/api';
import type { ContextPacket } from '@/types/context-packet';

export interface HealthResponse {
  status: string;
  version: string;
}

/**
 * GET /health — check if the backend is running.
 */
export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

/**
 * GET /mock — returns a hardcoded Context Packet for frontend development.
 * Same shape as POST /analyze-video response.
 */
export async function getMockContext(): Promise<ContextPacket> {
  const res = await fetch(`${API_BASE_URL}/mock`);
  if (!res.ok) throw new Error(`Mock context failed: ${res.status}`);
  return res.json();
}

/**
 * POST /analyze-video — upload a video file and get back a full Context Packet.
 * Use when the full pipeline is running and you have a video URI or file.
 */
export async function analyzeVideo(uri: string): Promise<ContextPacket> {
  const formData = new FormData();
  // React Native: create a file object from URI
  const filename = uri.split('/').pop() ?? 'video.mp4';
  formData.append('file', {
    uri,
    name: filename,
    type: 'video/mp4',
  } as unknown as Blob);

  const res = await fetch(`${API_BASE_URL}/analyze-video`, {
    method: 'POST',
    body: formData,
    // Do not set Content-Type; fetch sets it with boundary for FormData
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Analyze video failed: ${res.status} — ${text}`);
  }
  return res.json();
}
