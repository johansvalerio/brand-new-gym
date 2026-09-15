"use client";

import { useEffect } from "react";
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession";
import { usePushNotifications } from "../hooks/usePushNotifications";

/**
 * Componente invisible que auto-suscribe a push cuando el usuario se loguea
 * (silencioso si ya está suscrito / si el browser no soporta).
 */
export function PushSubscriber() {
  const { profile } = useAuthSession();
  const { subscribe } = usePushNotifications();

  useEffect(() => {
    if (!profile) return;
    // Solo cuando permiso ya otorgado o por primera vez: intentlo silencioso.
    void subscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  return null;
}
