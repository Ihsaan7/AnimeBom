"use client";
import { usePathname } from "next/navigation";

export default function ConditionalPadding({ children }) {
  const pathname = usePathname();
  const hideHeader = pathname.startsWith("/signin") || pathname.startsWith("/signup") || pathname.startsWith("/auth");
  
  return (
    <div style={{ paddingTop: hideHeader ? '0px' : '70px' }}>
      {children}
    </div>
  );
}