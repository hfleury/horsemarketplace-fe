import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import posthog, { type CaptureResult } from 'posthog-js';

vi.mock('posthog-js', () => ({
  default: {
    init: vi.fn(),
    capture: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
    opt_in_capturing: vi.fn(),
    opt_out_capturing: vi.fn(),
  },
}));

// The adapter keeps whether PostHog has started in module state, so each test
// loads a fresh copy of it.
async function loadAnalytics() {
  vi.resetModules();
  return import('./analytics');
}

function eventAt(url: string): CaptureResult {
  return { uuid: '1', event: '$pageview', properties: { $current_url: url } } as CaptureResult;
}

describe('analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test');
    vi.stubEnv('VITE_POSTHOG_HOST', 'https://eu.i.posthog.com');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does nothing without an API key', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', '');
    const analytics = await loadAnalytics();

    await analytics.startAnalytics();
    analytics.trackEvent('listing_viewed', { listing_id: '1' });

    expect(posthog.init).not.toHaveBeenCalled();
    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it('initialises PostHog once, with autocapture and replay off', async () => {
    const analytics = await loadAnalytics();

    await Promise.all([analytics.startAnalytics(), analytics.startAnalytics()]);

    expect(posthog.init).toHaveBeenCalledTimes(1);
    expect(posthog.init).toHaveBeenCalledWith('phc_test', {
      api_host: 'https://eu.i.posthog.com',
      person_profiles: 'identified_only',
      autocapture: false,
      capture_pageview: 'history_change',
      disable_session_recording: true,
      disable_surveys: true,
      before_send: analytics.dropExcludedPages,
    });
  });

  it('tracks nothing before start or after stop', async () => {
    const analytics = await loadAnalytics();

    analytics.trackEvent('listing_viewed', {});
    analytics.identifyUser('user-1');
    await analytics.startAnalytics();
    analytics.stopAnalytics();
    analytics.trackEvent('listing_viewed', {});

    expect(posthog.capture).not.toHaveBeenCalled();
    expect(posthog.identify).not.toHaveBeenCalled();
    expect(posthog.opt_out_capturing).toHaveBeenCalledTimes(1);
    expect(posthog.reset).toHaveBeenCalledTimes(1);
  });

  it('captures, identifies and resets while started', async () => {
    const analytics = await loadAnalytics();

    await analytics.startAnalytics();
    analytics.trackEvent('listing_viewed', { listing_id: '1' });
    analytics.identifyUser('user-1');
    analytics.resetAnalyticsUser();

    expect(posthog.capture).toHaveBeenCalledWith('listing_viewed', { listing_id: '1' });
    expect(posthog.identify).toHaveBeenCalledWith('user-1');
    expect(posthog.reset).toHaveBeenCalledTimes(1);
  });

  it('opts back in instead of re-initialising after a stop', async () => {
    const analytics = await loadAnalytics();

    await analytics.startAnalytics();
    analytics.stopAnalytics();
    await analytics.startAnalytics();

    expect(posthog.init).toHaveBeenCalledTimes(1);
    expect(posthog.opt_in_capturing).toHaveBeenCalledTimes(1);
  });

  it('does not start if consent is withdrawn while PostHog is loading', async () => {
    const analytics = await loadAnalytics();

    const starting = analytics.startAnalytics();
    analytics.stopAnalytics();
    await starting;
    analytics.trackEvent('listing_viewed', {});

    expect(posthog.init).not.toHaveBeenCalled();
    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it('drops events from admin pages and keeps the rest', async () => {
    const { dropExcludedPages } = await loadAnalytics();

    expect(dropExcludedPages(eventAt('https://horsemarket.se/admin/users'))).toBeNull();
    expect(dropExcludedPages(eventAt('https://horsemarket.se/listings'))).not.toBeNull();
    expect(dropExcludedPages(eventAt('not a url'))).not.toBeNull();
  });
});
