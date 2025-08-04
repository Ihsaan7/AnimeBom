"use client";
import { usePathname } from "next/navigation";
import Header from "./Header.js";

export default function ClientHeaderWrapper() {
  const pathname = usePathname();
  const hideHeader = pathname.startsWith("/signin") || pathname.startsWith("/signup") || pathname.startsWith("/auth");
  if (hideHeader) return null;
  return <Header />;
}