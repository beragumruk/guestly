"use client";

import { classifyFeedback } from "./classifier";
import { initialState } from "./workspace-data";
import type {
  ActionItem,
  ActionStatus,
  GuestlySession,
  Feedback,
  FeedbackLocation,
  FeedbackStatus,
  GuestlyState,
  LocationType,
  NotificationPreferences,
} from "./types";
import type { IntegrationEvent } from "./integrations/types";

const STATE_KEY = "guestly.workspace.state.v2";
const SESSION_KEY = "guestly.workspace.session.v1";

function copyInitialState(): GuestlyState {
  return JSON.parse(JSON.stringify(initialState)) as GuestlyState;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function readState(): GuestlyState {
  if (!isBrowser()) return copyInitialState();
  const stored = window.localStorage.getItem(STATE_KEY);
  if (!stored) {
    const seeded = copyInitialState();
    window.localStorage.setItem(STATE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    return { ...copyInitialState(), ...(JSON.parse(stored) as GuestlyState) };
  } catch {
    const seeded = copyInitialState();
    window.localStorage.setItem(STATE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function writeState(state: GuestlyState) {
  if (isBrowser()) window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getState() {
  return readState();
}

export function subscribeToGuestlyState(callback: (state: GuestlyState) => void) {
  if (!isBrowser()) return () => {};
  const handler = () => callback(readState());
  window.addEventListener("guestly-state-change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("guestly-state-change", handler);
    window.removeEventListener("storage", handler);
  };
}

function commitState(mutator: (state: GuestlyState) => GuestlyState) {
  const next = mutator(readState());
  writeState(next);
  if (isBrowser()) window.dispatchEvent(new Event("guestly-state-change"));
  return next;
}

function dispatchIntegrationEvent(event: IntegrationEvent, feedback: Feedback, state: GuestlyState) {
  if (!isBrowser() || !getSession()) return;
  const location = state.locations.find((item) => item.id === feedback.locationId);
  if (!location) return;
  void fetch("/api/integrations/dispatch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, feedback, location }),
  }).catch(() => {});
}

function recordSecurityActivity(eventType: "location.created" | "location.updated" | "organization.settings_changed", objectLabel?: string) {
  if (!isBrowser() || !getSession()) return;
  void fetch("/api/security/activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventType, objectLabel }),
  }).catch(() => {});
}

export function getSession(): GuestlySession | null {
  if (!isBrowser()) return null;
  const stored = window.localStorage.getItem(SESSION_KEY);
  return stored ? (JSON.parse(stored) as GuestlySession) : null;
}

export function signInManager() {
  if (!isBrowser()) return;
  const state = readState();
  const session: GuestlySession = {
    userId: state.user.id,
    organizationId: state.organization.id,
    signedInAt: new Date().toISOString(),
  };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function signOutManager() {
  if (isBrowser()) window.localStorage.removeItem(SESSION_KEY);
}

export function findLocationBySlug(slug: string) {
  return readState().locations.find((location) => location.publicSlug === slug && location.active);
}

export function createLocation(input: { name: string; locationType: LocationType; referenceCode: string }) {
  const next = commitState((state) => {
    const baseSlug = slugify(`${state.organization.name}-${input.name}-${input.referenceCode}`);
    const publicSlug = state.locations.some((location) => location.publicSlug === baseSlug)
      ? `${baseSlug}-${state.locations.length + 1}`
      : baseSlug;
    const location: FeedbackLocation = {
      id: uid("loc"),
      organizationId: state.organization.id,
      name: input.name,
      locationType: input.locationType,
      referenceCode: input.referenceCode,
      publicSlug,
      active: true,
      createdAt: new Date().toISOString(),
    };
    return { ...state, locations: [location, ...state.locations] };
  });
  recordSecurityActivity("location.created", input.name);
  return next;
}

export function updateLocation(id: string, patch: Partial<Pick<FeedbackLocation, "name" | "referenceCode" | "active">>) {
  const next = commitState((state) => ({
    ...state,
    locations: state.locations.map((location) => (location.id === id ? { ...location, ...patch } : location)),
  }));
  recordSecurityActivity("location.updated", next.locations.find((location) => location.id === id)?.name);
  return next;
}

export function submitFeedback(input: {
  locationId: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  message: string;
  guestName?: string;
  guestEmail?: string;
  visitContext?: string;
}) {
  const classification = classifyFeedback(input.message, input.rating);
  return commitState((state) => {
    const feedback: Feedback = {
      id: uid("fb"),
      organizationId: state.organization.id,
      locationId: input.locationId,
      rating: input.rating,
      message: input.message,
      guestName: input.guestName || undefined,
      guestEmail: input.guestEmail || undefined,
      visitContext: input.visitContext || undefined,
      ...classification,
      status: "new",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { ...state, feedback: [feedback, ...state.feedback] };
  });
}

export function updateFeedbackStatus(id: string, status: FeedbackStatus) {
  const previous = readState();
  const feedback = previous.feedback.find((item) => item.id === id);
  const next = commitState((state) => ({
    ...state,
    feedback: state.feedback.map((feedback) =>
      feedback.id === id ? { ...feedback, status, updatedAt: new Date().toISOString() } : feedback,
    ),
  }));
  const updated = next.feedback.find((item) => item.id === id);
  if (feedback && updated && feedback.status !== updated.status) dispatchIntegrationEvent("feedback.updated", updated, next);
  return next;
}

export function createActionItem(feedbackId: string, title?: string) {
  return commitState((state) => {
    const feedback = state.feedback.find((item) => item.id === feedbackId);
    if (!feedback) return state;
    const action: ActionItem = {
      id: uid("act"),
      feedbackId,
      organizationId: state.organization.id,
      title: title || feedback.suggestedAction,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    return { ...state, actionItems: [action, ...state.actionItems] };
  });
}

export function updateActionStatus(id: string, status: ActionStatus) {
  return commitState((state) => ({
    ...state,
    actionItems: state.actionItems.map((item) => (item.id === id ? { ...item, status } : item)),
  }));
}

export function updateSettings(input: {
  organizationName: string;
  businessType: GuestlyState["organization"]["businessType"];
  userName: string;
  email: string;
  notificationPreferences: NotificationPreferences;
}) {
  const next = commitState((state) => ({
    ...state,
    organization: { ...state.organization, name: input.organizationName, businessType: input.businessType },
    user: { ...state.user, name: input.userName, email: input.email },
    notificationPreferences: input.notificationPreferences,
  }));
  recordSecurityActivity("organization.settings_changed", input.organizationName);
  return next;
}
