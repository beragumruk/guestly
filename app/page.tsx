"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/store";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getSession() ? "/dashboard" : "/login");
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center">
      <div className="panel rounded-xl p-6 text-sm text-zinc-500">Opening Guestly...</div>
    </main>
  );
}
