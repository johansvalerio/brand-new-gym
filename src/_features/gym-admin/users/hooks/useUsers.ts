"use client";

import { useCallback, useEffect, useState } from "react";
import type { Tables } from "@/types/database.types";
import { createClient } from "@/lib/supabase/client";

export type UserRow = Tables<"users">;

export function useUsers() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        const supabase = createClient();
        setLoading(true);

        const { data, error } = await supabase
            .from("users")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            setError(error.message);
            setUsers([]);
            setLoading(false);
            return;
        }

        setUsers(data ?? []);
        setError(null);
        setLoading(false);
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void refetch();
        }, 0);

        return () => window.clearTimeout(timer);
    }, [refetch]);

    return { users, loading, error, refetch, setUsers };
}
