"use client";

import { useMemo, useState } from "react";
import { FeedbackTable } from "@/components/feedback-components";
import { FilterBar, PageHeader, Select } from "@/components/ui";
import { useGuestly } from "@/components/use-guestly";
import type { Department, FeedbackStatus, IssueType, Sentiment, Urgency } from "@/lib/types";

export default function FeedbackPage() {
  const state = useGuestly();
  const [search, setSearch] = useState("");
  const [sentiment, setSentiment] = useState<Sentiment | "all">("all");
  const [urgency, setUrgency] = useState<Urgency | "all">("all");
  const [department, setDepartment] = useState<Department | "all">("all");
  const [status, setStatus] = useState<FeedbackStatus | "all">("all");
  const [issueType, setIssueType] = useState<IssueType | "all">("all");
  const [locationId, setLocationId] = useState("all");

  const filtered = useMemo(() => {
    if (!state) return [];
    const query = search.trim().toLowerCase();
    return state.feedback.filter((item) => {
      const location = state.locations.find((loc) => loc.id === item.locationId);
      const haystack = [item.message, item.aiSummary, item.suggestedAction, item.guestName, item.guestEmail, location?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        (!query || haystack.includes(query)) &&
        (sentiment === "all" || item.sentiment === sentiment) &&
        (urgency === "all" || item.urgency === urgency) &&
        (department === "all" || item.department === department) &&
        (status === "all" || item.status === status) &&
        (issueType === "all" || item.issueType === issueType) &&
        (locationId === "all" || item.locationId === locationId)
      );
    });
  }, [department, issueType, locationId, search, sentiment, state, status, urgency]);

  if (!state) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Feedback inbox"
        title="Classify, prioritize, and close the loop."
        text="Every guest signal is normalized with sentiment, urgency, issue type, department routing, and a suggested action."
      />
      <FilterBar search={search} onSearch={setSearch}>
        <Select value={sentiment} onChange={(event) => setSentiment(event.target.value as Sentiment | "all")}>
          <option value="all">All sentiment</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
          <option value="mixed">Mixed</option>
        </Select>
        <Select value={urgency} onChange={(event) => setUrgency(event.target.value as Urgency | "all")}>
          <option value="all">All urgency</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </Select>
        <Select value={department} onChange={(event) => setDepartment(event.target.value as Department | "all")}>
          <option value="all">All departments</option>
          <option value="rooms">Rooms</option>
          <option value="front_desk">Front desk</option>
          <option value="housekeeping">Housekeeping</option>
          <option value="kitchen">Kitchen</option>
          <option value="service">Service</option>
          <option value="management">Management</option>
          <option value="maintenance">Maintenance</option>
          <option value="other">Other</option>
        </Select>
        <Select value={status} onChange={(event) => setStatus(event.target.value as FeedbackStatus | "all")}>
          <option value="all">All status</option>
          <option value="new">New</option>
          <option value="in_review">In review</option>
          <option value="assigned">Assigned</option>
          <option value="resolved">Resolved</option>
          <option value="archived">Archived</option>
        </Select>
        <Select value={issueType} onChange={(event) => setIssueType(event.target.value as IssueType | "all")}>
          <option value="all">All issue types</option>
          <option value="cleanliness">Cleanliness</option>
          <option value="noise">Noise</option>
          <option value="food_quality">Food quality</option>
          <option value="staff">Staff</option>
          <option value="wait_time">Wait time</option>
          <option value="safety">Safety</option>
          <option value="billing">Billing</option>
          <option value="comfort">Comfort</option>
          <option value="maintenance">Maintenance</option>
          <option value="other">Other</option>
        </Select>
        <Select value={locationId} onChange={(event) => setLocationId(event.target.value)}>
          <option value="all">All locations</option>
          {state.locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </Select>
      </FilterBar>
      <FeedbackTable feedback={filtered} locations={state.locations} />
    </div>
  );
}
