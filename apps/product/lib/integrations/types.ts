import type { Feedback, FeedbackLocation, IssueType } from "@/lib/types";

export const integrationEvents = ["feedback.created", "feedback.urgent", "feedback.updated"] as const;
export type IntegrationEvent = (typeof integrationEvents)[number];
export type IntegrationProvider = "email" | "slack";
export type IntegrationStatus = "connected" | "not_connected" | "needs_attention" | "coming_soon";

export interface EmailRules {
  allNewFeedback: boolean;
  urgentFeedback: boolean;
  negativeFeedback: boolean;
  selectedCategories: IssueType[];
  dailySummary: boolean;
}

export interface EmailIntegrationConfig {
  recipients: string[];
  rules: EmailRules;
}

export interface SlackIntegrationConfig {
  channelId?: string;
  channelName?: string;
  events: IntegrationEvent[];
}

export interface IntegrationConnection {
  id: string;
  organizationId: string;
  provider: IntegrationProvider;
  enabled: boolean;
  status: IntegrationStatus;
  config: EmailIntegrationConfig | SlackIntegrationConfig;
  secret?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookEndpoint {
  id: string;
  organizationId: string;
  endpoint: string;
  enabled: boolean;
  events: IntegrationEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDelivery {
  id: string;
  organizationId: string;
  webhookId: string;
  event: IntegrationEvent;
  statusCode?: number | null;
  success: boolean;
  error?: string | null;
  attemptedAt: string;
}

export interface DispatchInput {
  event: IntegrationEvent;
  organizationId: string;
  feedback: Feedback;
  location: FeedbackLocation;
}

export function isUrgentFeedback(feedback: Feedback) {
  return feedback.priority === "high" || feedback.priority === "critical" || feedback.urgency === "high" || feedback.urgency === "critical";
}
