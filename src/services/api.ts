/**
 * Central place where the frontend will later talk to the FastAPI backend.
 *
 * Every service function in this folder resolves through `respond()`. Today it
 * returns mock data with a small simulated latency. When the backend exists,
 * swap the body of `request()` for a real `fetch(API_BASE_URL + path)` call and
 * no UI component needs to change.
 */

export const API_BASE_URL = "/api";

export async function respond<T>(value: T, delayMs = 120): Promise<T> {
  if (delayMs <= 0) return value;
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return value;
}

/** Placeholder for the future real transport. */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}
