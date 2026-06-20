"use client";

import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import { LocationCard } from "@/components/location-components";
import { Button, Card, FormField, Input, PageHeader, Select } from "@/components/ui";
import { useGuestly } from "@/components/use-guestly";
import { createLocation } from "@/lib/store";
import type { LocationType } from "@/lib/types";

export default function LocationsPage() {
  const state = useGuestly();
  const [name, setName] = useState("");
  const [referenceCode, setReferenceCode] = useState("");
  const [locationType, setLocationType] = useState<LocationType>("room");

  if (!state) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createLocation({ name, referenceCode, locationType });
    setName("");
    setReferenceCode("");
    setLocationType("room");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Collection locations"
        title="Create QR-code feedback points."
        text="Generate public feedback links for rooms, tables, counters, receipts, lobby signage, and post-stay email flows."
      />
      <Card className="p-5">
        <form className="grid gap-4 lg:grid-cols-[1fr_12rem_12rem_auto] lg:items-end" onSubmit={submit}>
          <FormField label="Location name">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Room 412" required />
          </FormField>
          <FormField label="Type">
            <Select value={locationType} onChange={(event) => setLocationType(event.target.value as LocationType)}>
              <option value="room">Room</option>
              <option value="lobby">Lobby</option>
              <option value="table">Table</option>
              <option value="receipt">Receipt</option>
              <option value="counter">Counter</option>
              <option value="email">Email</option>
              <option value="other">Other</option>
            </Select>
          </FormField>
          <FormField label="Reference">
            <Input value={referenceCode} onChange={(event) => setReferenceCode(event.target.value)} placeholder="412" required />
          </FormField>
          <Button type="submit">
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </form>
      </Card>
      <div className="grid gap-4">
        {state.locations.map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
      </div>
    </div>
  );
}
