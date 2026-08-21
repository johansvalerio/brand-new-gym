"use client";

import { useEffect, useState } from "react";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database.types";

export function useAuthSession() {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [role, setRole] = useState<Tables<"users">["role"] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        const syncSession = async () => {
            const {
                data: { session: currentSession },
            } = await supabase.auth.getSession();

            setSession(currentSession);
            setUser(currentSession?.user ?? null);

            if (currentSession?.user?.id) {
                const { data: profile } = await supabase
                    .from("users")
                    .select("role")
                    .eq("auth_id", currentSession.user.id)
                    .maybeSingle();

                setRole(profile?.role ?? null);
            } else {
                setRole(null);
            }

            setLoading(false);
        };

        void syncSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
            setSession(nextSession);
            setUser(nextSession?.user ?? null);

            if (nextSession?.user?.id) {
                const { data: profile } = await supabase
                    .from("users")
                    .select("role")
                    .eq("auth_id", nextSession.user.id)
                    .maybeSingle();

                setRole(profile?.role ?? null);
            } else {
                setRole(null);
            }

            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return {
        session,
        user,
        role,
        isAdmin: role === "admin",
        loading,
    };
}
