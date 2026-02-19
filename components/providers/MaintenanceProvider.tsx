"use client";

import { useEffect } from "react";
import { Maintenance } from "@/lib/maintenance";

export default function MaintenanceProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        Maintenance.init();
    }, []);

    return <>{children}</>;
}
