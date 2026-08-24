"use client";

import { useEffect } from "react";
import { syncAllDataFromSupabase } from "@/lib/storage";

export default function SupabaseSyncProvider() {
  useEffect(() => {
    // Automatically sync all 4 tables (cards, cashback_rules, mcc_codes, transactions) on app load
    syncAllDataFromSupabase();
  }, []);

  return null;
}
