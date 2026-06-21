"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button, Card, FormField, Input, PageHeader, Select } from "@/components/ui";
import { useGuestly } from "@/components/use-guestly";
import { updateSettings } from "@/lib/store";
import type { BusinessType } from "@/lib/types";

export default function SettingsPage() {
  const state = useGuestly();
  const [organizationName, setOrganizationName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("boutique_hotel");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [weeklyTrends, setWeeklyTrends] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!state) return;
    setOrganizationName(state.organization.name);
    setBusinessType(state.organization.businessType);
    setUserName(state.user.name);
    setEmail(state.user.email);
    setCriticalAlerts(state.notificationPreferences.criticalAlerts);
    setDailyDigest(state.notificationPreferences.dailyDigest);
    setWeeklyTrends(state.notificationPreferences.weeklyTrends);
  }, [state]);

  if (!state) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateSettings({
      organizationName,
      businessType,
      userName,
      email,
      notificationPreferences: { criticalAlerts, dailyDigest, weeklyTrends },
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Workspace and notification preferences."
        text="Manage the workspace profile and alert preferences used across Guestly intelligence workflows."
      />
      <form className="grid gap-4 xl:grid-cols-[1fr_0.75fr]" onSubmit={submit}>
        <Card className="p-5">
          <p className="mono-label">Organization</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <FormField label="Organization name">
              <Input value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} required />
            </FormField>
            <FormField label="Business type">
              <Select value={businessType} onChange={(event) => setBusinessType(event.target.value as BusinessType)}>
                <option value="hotel">Hotel</option>
                <option value="boutique_hotel">Boutique hotel</option>
                <option value="cafe">Cafe</option>
                <option value="restaurant">Restaurant</option>
                <option value="hospitality_group">Hospitality group</option>
                <option value="other">Other</option>
              </Select>
            </FormField>
            <FormField label="User name">
              <Input value={userName} onChange={(event) => setUserName(event.target.value)} required />
            </FormField>
            <FormField label="Email">
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </FormField>
          </div>
        </Card>
        <Card className="p-5">
          <p className="mono-label">Notifications</p>
          <div className="mt-5 grid gap-3">
            <Toggle label="Critical risk alerts" checked={criticalAlerts} onChange={setCriticalAlerts} />
            <Toggle label="Daily feedback digest" checked={dailyDigest} onChange={setDailyDigest} />
            <Toggle label="Weekly trend report" checked={weeklyTrends} onChange={setWeeklyTrends} />
          </div>
          <Button className="mt-6 w-full" type="submit">
            <Save className="h-4 w-4" />
            {saved ? "Saved" : "Save settings"}
          </Button>
        </Card>
      </form>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <input className="h-4 w-4 accent-zinc-950" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}
