import type { CaptureResult, PostHog } from 'posthog-js';

// The only module that talks to PostHog. Its code is downloaded only after the
// visitor accepts analytics, and every call is a no-op before that or after a
// withdrawal.

const DEFAULT_HOST = 'https://eu.i.posthog.com';
const EXCLUDED_PATH_PREFIX = '/admin';

let postHogModule: Promise<PostHog> | null = null;
let client: PostHog | null = null;
let initialised = false;
let capturing = false;
let consentGiven = false;

function loadPostHog(): Promise<PostHog> {
  postHogModule ??= import('posthog-js').then((module) => module.default);
  return postHogModule;
}

function isExcludedUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false;
  try {
    return new URL(url).pathname.startsWith(EXCLUDED_PATH_PREFIX);
  } catch {
    return false;
  }
}

export function dropExcludedPages(event: CaptureResult | null): CaptureResult | null {
  if (!event) return null;
  return isExcludedUrl(event.properties?.$current_url) ? null : event;
}

export async function startAnalytics(): Promise<void> {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key) return;
  consentGiven = true;

  const posthog = await loadPostHog();
  // Consent may have been withdrawn, or another call may have started, while loading.
  if (!consentGiven || capturing) return;

  if (initialised) {
    posthog.opt_in_capturing();
  } else {
    posthog.init(key, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || DEFAULT_HOST,
      person_profiles: 'identified_only',
      autocapture: false,
      capture_pageview: 'history_change',
      disable_session_recording: true,
      disable_surveys: true,
      before_send: dropExcludedPages,
    });
    initialised = true;
  }
  client = posthog;
  capturing = true;
}

export function stopAnalytics(): void {
  consentGiven = false;
  if (!client || !capturing) return;
  client.opt_out_capturing();
  client.reset();
  capturing = false;
}

export function trackEvent(name: string, properties: Record<string, unknown>): void {
  if (client && capturing) client.capture(name, properties);
}

export function identifyUser(userId: string): void {
  if (client && capturing) client.identify(userId);
}

export function resetAnalyticsUser(): void {
  if (client && capturing) client.reset();
}
