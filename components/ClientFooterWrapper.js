"use client";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ClientFooterWrapper() {
  const pathname = usePathname();
  const hideFooter = pathname.startsWith("/signin") || pathname.startsWith("/signup") || pathname.startsWith("/auth");
  if (hideFooter) return null;
  return <Footer />;
}
