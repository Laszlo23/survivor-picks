"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Ably from "ably";

// ─── Singleton Ably Realtime client (client-side) ────────────────────────────

let _realtimeClient: Ably.Realtime | null = null;

function getAblyClient(): Ably.Realtime {
  if (!_realtimeClient) {
    _realtimeClient = new Ably.Realtime({
      authUrl: "/api/realtime/token",
      authMethod: "POST",
    });
  }
  return _realtimeClient;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/** Subscribe to a channel and receive messages */
export function useAblyChannel(
  channelName: string | null,
  eventName: string,
  onMessage: (msg: Ably.Message) => void
) {
  const callbackRef = useRef(onMessage);
  callbackRef.current = onMessage;

  useEffect(() => {
    if (!channelName) return;

    const client = getAblyClient();
    const channel = client.channels.get(channelName);

    const handler = (msg: Ably.Message) => {
      callbackRef.current(msg);
    };

    channel.subscribe(eventName, handler);

    return () => {
      channel.unsubscribe(eventName, handler);
    };
  }, [channelName, eventName]);
}

/** Subscribe to all events on a channel */
export function useAblyChannelAll(
  channelName: string | null,
  onMessage: (msg: Ably.Message) => void
) {
  const callbackRef = useRef(onMessage);
  callbackRef.current = onMessage;

  useEffect(() => {
    if (!channelName) return;

    const client = getAblyClient();
    const channel = client.channels.get(channelName);

    const handler = (msg: Ably.Message) => {
      callbackRef.current(msg);
    };

    channel.subscribe(handler);

    return () => {
      channel.unsubscribe(handler);
    };
  }, [channelName]);
}

/** Get the current connection state */
export function useAblyConnectionState() {
  const [state, setState] = useState<string>("initialized");

  useEffect(() => {
    const client = getAblyClient();
    setState(client.connection.state);

    const handler = (stateChange: Ably.ConnectionStateChange) => {
      setState(stateChange.current);
    };

    client.connection.on(handler);
    return () => {
      client.connection.off(handler);
    };
  }, []);

  return state;
}

/** Get presence count for a channel */
export function useAblyPresence(channelName: string | null) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!channelName) return;

    const client = getAblyClient();
    const channel = client.channels.get(channelName);

    const updateCount = async () => {
      try {
        const members = await channel.presence.get();
        setCount(members.length);
      } catch {
        // ignore
      }
    };

    channel.presence.enter().then(updateCount);

    channel.presence.subscribe("enter", updateCount);
    channel.presence.subscribe("leave", updateCount);

    return () => {
      channel.presence.unsubscribe();
      channel.presence.leave();
    };
  }, [channelName]);

  return count;
}

/** Cleanup Ably on unmount */
export function useAblyCleanup() {
  useEffect(() => {
    return () => {
      if (_realtimeClient) {
        _realtimeClient.close();
        _realtimeClient = null;
      }
    };
  }, []);
}
