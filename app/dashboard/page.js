"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page since main content is now there
    router.push("/");
  }, [router]);

  return null;
}
