"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();

  useEffect(() => {
    router.push("/auth?mode=signup");
  }, [router]);

  return null;
}