import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseCredentials(): { url: string; key: string } {
  if (typeof window !== "undefined") {
    const savedUrl = localStorage.getItem("mcc_supabase_url");
    const savedKey = localStorage.getItem("mcc_supabase_key");
    if (savedUrl && savedKey) {
      return { url: savedUrl, key: savedKey };
    }
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  };
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();

  if (!url || !key) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key);
    } catch (e) {
      console.error("Lỗi khởi tạo Supabase Client:", e);
      return null;
    }
  }

  return supabaseInstance;
}

export function resetSupabaseClient(): void {
  supabaseInstance = null;
}
