export type BusinessType = "hotel" | "boutique_hotel" | "cafe" | "restaurant" | "hospitality_group" | "other";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "free";
export type UserRole = "owner" | "manager" | "staff";
export type LocationType = "room" | "lobby" | "table" | "receipt" | "counter" | "email" | "other";
export type Sentiment = "positive" | "neutral" | "negative" | "mixed";
export type Urgency = "low" | "medium" | "high" | "critical";
export type Priority = "low" | "medium" | "high" | "critical";
export type Department =
  | "rooms"
  | "front_desk"
  | "housekeeping"
  | "kitchen"
  | "service"
  | "management"
  | "maintenance"
  | "other";
export type IssueType =
  | "cleanliness"
  | "noise"
  | "food_quality"
  | "staff"
  | "wait_time"
  | "safety"
  | "billing"
  | "comfort"
  | "maintenance"
  | "other";
export type FeedbackStatus = "new" | "in_review" | "assigned" | "resolved" | "archived";
export type ActionStatus = "open" | "in_progress" | "resolved";

export interface Organization {
  id: string;
  name: string;
  businessType: BusinessType;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  role: UserRole;
  createdAt: string;
}

export interface FeedbackLocation {
  id: string;
  organizationId: string;
  name: string;
  locationType: LocationType;
  referenceCode: string;
  publicSlug: string;
  active: boolean;
  createdAt: string;
}

export interface Classification {
  sentiment: Sentiment;
  urgency: Urgency;
  priority: Priority;
  department: Department;
  issueType: IssueType;
  aiSummary: string;
  suggestedAction: string;
  riskFlags?: string[];
}

export interface Feedback extends Classification {
  id: string;
  organizationId: string;
  locationId: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  message: string;
  guestName?: string;
  guestEmail?: string;
  visitContext?: string;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  id: string;
  feedbackId: string;
  organizationId: string;
  title: string;
  owner?: string;
  status: ActionStatus;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  featured: boolean;
}

export interface NotificationPreferences {
  criticalAlerts: boolean;
  dailyDigest: boolean;
  weeklyTrends: boolean;
}

export interface GuestlyState {
  organization: Organization;
  user: UserProfile;
  locations: FeedbackLocation[];
  feedback: Feedback[];
  actionItems: ActionItem[];
  notificationPreferences: NotificationPreferences;
}

export interface GuestlySession {
  userId: string;
  organizationId: string;
  signedInAt: string;
}
