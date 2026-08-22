"use client";

import { useEffect, useState } from "react";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database.types";

export function useAuthSession() {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [profile, setProfile] = useState<Tables<"users"> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        const syncProfile = async (authId: string | undefined) => {
            if (!authId) {
                setProfile(null);
                return;
            }

            const { data: row } = await supabase
                .from("users")
                .select("*")
                .eq("auth_id", authId)
                .maybeSingle();

            setProfile(row ?? null);
        };

        const syncSession = async () => {
            const {
                data: { session: currentSession },
            } = await supabase.auth.getSession();

            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            await syncProfile(currentSession?.user?.id);

            setLoading(false);
        };

        void syncSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
            setSession(nextSession);
            setUser(nextSession?.user ?? null);
            await syncProfile(nextSession?.user?.id);

            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return {
        session,
        user,
        profile,
        role: profile?.role ?? null,
        isAdmin: profile?.role === "admin",
        isCoach: profile?.role === "coach",
        loading,
    };
}
