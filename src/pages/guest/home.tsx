import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { getHealth } from "@/api/checkerApi";
import { initCheckerApp } from "@/checker-app";
import { cn } from "@/lib/cn";

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    getHealth()
      .then(() => setBackendStatus("online"))
      .catch(() => setBackendStatus("offline"));
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      initCheckerApp(containerRef.current);
    }
  }, []);

  return (
    <>
      <div className="fixed right-4 top-4 z-50 flex flex-col items-end gap-2">
        <div
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium shadow-sm",
            backendStatus === "online" && "bg-emerald-100 text-emerald-800",
            backendStatus === "offline" && "bg-amber-100 text-amber-800",
            backendStatus === "checking" && "bg-slate-100 text-slate-600",
          )}
        >
          {backendStatus === "checking" && "Checking PHP backend..."}
          {backendStatus === "online" && "PHP Backend: Connected (Axios)"}
          {backendStatus === "offline" && "PHP Backend: Offline — run docker compose up -d"}
        </div>
        <Link
          to="/issues"
          className="rounded-full bg-[#137966] px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-[#0f5c4d]"
        >
          Manage Issues (CRUD)
        </Link>
      </div>
      <div ref={containerRef} />
    </>
  );
}
