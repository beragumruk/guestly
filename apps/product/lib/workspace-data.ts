import { classifyFeedback } from "./classifier";
import type { ActionItem, Feedback, FeedbackLocation, GuestlyState, Organization, SubscriptionPlan, UserProfile } from "./types";

const now = new Date("2026-06-20T14:00:00.000Z");

function daysAgo(days: number) {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export const launchOrganization: Organization = {
  id: "org_guestly_demo",
  name: "Guestly Demo Workspace",
  businessType: "hospitality_group",
  subscriptionStatus: "active",
  createdAt: "2026-05-18T12:00:00.000Z",
};

export const launchUser: UserProfile = {
  id: "usr_demo_manager",
  email: "workspace@getguestly.com",
  name: "Demo Manager",
  organizationId: launchOrganization.id,
  role: "owner",
  createdAt: "2026-05-18T12:05:00.000Z",
};

export const seedLocations: FeedbackLocation[] = [
  { id: "loc_guest_room", organizationId: launchOrganization.id, name: "Guest Room Touchpoint", locationType: "room", referenceCode: "ROOM", publicSlug: "guestly-demo-room", active: true, createdAt: daysAgo(27) },
  { id: "loc_front_desk", organizationId: launchOrganization.id, name: "Front Desk / Host Stand", locationType: "lobby", referenceCode: "ENTRY", publicSlug: "guestly-demo-front-desk", active: true, createdAt: daysAgo(25) },
  { id: "loc_counter", organizationId: launchOrganization.id, name: "Counter Service", locationType: "counter", referenceCode: "COUNTER", publicSlug: "guestly-demo-counter", active: true, createdAt: daysAgo(22) },
  { id: "loc_dining_table", organizationId: launchOrganization.id, name: "Dining Table Touchpoint", locationType: "table", referenceCode: "TABLE", publicSlug: "guestly-demo-table", active: true, createdAt: daysAgo(18) },
  { id: "loc_post_visit", organizationId: launchOrganization.id, name: "Post-Visit Email", locationType: "email", referenceCode: "EMAIL", publicSlug: "guestly-demo-email", active: true, createdAt: daysAgo(16) },
  { id: "loc_receipt", organizationId: launchOrganization.id, name: "Receipt QR", locationType: "receipt", referenceCode: "RECEIPT", publicSlug: "guestly-demo-receipt", active: true, createdAt: daysAgo(15) },
];

const examples = [
  ["loc_guest_room", 2, "The room felt damp and the hallway noise made it hard to sleep.", "Mara L.", "mara@example.com", daysAgo(0)],
  ["loc_front_desk", 5, "The front desk team was excellent and check-in was fast.", "Daniel R.", undefined, daysAgo(1)],
  ["loc_dining_table", 2, "My food allergy was not handled confidently by the server.", "Avery K.", "avery@example.com", daysAgo(1)],
  ["loc_guest_room", 2, "The bathroom was not fully cleaned when we arrived.", "Priya S.", undefined, daysAgo(2)],
  ["loc_counter", 3, "The coffee line was very slow this morning.", undefined, undefined, daysAgo(3)],
  ["loc_guest_room", 1, "The AC unit kept turning off overnight.", "Owen M.", "owen@example.com", daysAgo(4)],
  ["loc_receipt", 2, "I was charged twice and need someone to fix the bill.", "Nadia P.", "nadia@example.com", daysAgo(5)],
  ["loc_dining_table", 3, "The table was sticky, but the staff was kind.", undefined, undefined, daysAgo(6)],
  ["loc_guest_room", 2, "There was a loud party near our room after midnight.", "Luis C.", undefined, daysAgo(7)],
  ["loc_post_visit", 5, "Great breakfast and very friendly staff.", "Heather W.", undefined, daysAgo(8)],
] as const;

export const seedFeedback: Feedback[] = examples.map(([locationId, rating, message, guestName, guestEmail, createdAt], index) => {
  const classification = classifyFeedback(message, rating);
  return {
    id: `fb_${index + 1}`,
    organizationId: launchOrganization.id,
    locationId,
    rating,
    message,
    guestName,
    guestEmail,
    visitContext: index % 2 === 0 ? "During stay" : "Post visit",
    ...classification,
    status: index < 3 ? "new" : index < 6 ? "in_review" : index < 8 ? "assigned" : "resolved",
    createdAt,
    updatedAt: createdAt,
  };
});

export const seedActionItems: ActionItem[] = [
  {
    id: "act_allergy",
    feedbackId: "fb_3",
    organizationId: launchOrganization.id,
    title: "Review allergen handling protocol with service lead",
    owner: "Mina",
    status: "open",
    createdAt: daysAgo(1),
  },
  {
    id: "act_ac",
    feedbackId: "fb_6",
    organizationId: launchOrganization.id,
    title: "Inspect overnight comfort issue",
    owner: "Facilities",
    status: "in_progress",
    createdAt: daysAgo(4),
  },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "core",
    name: "Core Plan",
    price: 29,
    interval: "month",
    featured: false,
    features: ["QR feedback links", "AI-style classification", "Feedback inbox", "Action queue", "Basic analytics"],
  },
  {
    id: "pro",
    name: "Pro Plan",
    price: 99,
    interval: "month",
    featured: true,
    features: ["Everything in Core", "Advanced pattern detection", "Multi-location reporting", "Leadership summaries", "Priority onboarding"],
  },
];

export const initialState: GuestlyState = {
  organization: launchOrganization,
  user: launchUser,
  locations: seedLocations,
  feedback: seedFeedback,
  actionItems: seedActionItems,
  notificationPreferences: {
    criticalAlerts: true,
    dailyDigest: true,
    weeklyTrends: false,
  },
};
