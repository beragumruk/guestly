"use client";

import { useEffect, useState } from "react";
import { getState, subscribeToGuestlyState } from "@/lib/store";
import type { GuestlyState } from "@/lib/types";

export function useGuestly() {
  const [state, setState] = useState<GuestlyState | null>(null);

  useEffect(() => {
    setState(getState());
    return subscribeToGuestlyState(setState);
  }, []);

  return state;
}
