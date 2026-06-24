import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetDashboardSummaryQueryKey,
  getGetEventTimelineQueryKey,
  getGetEventBreakdownQueryKey,
  getGetCameraHealthQueryKey,
  getListEventsQueryKey,
  getListAlertsQueryKey,
} from "@workspace/api-client-react";

export function useLiveStream() {
  const queryClient = useQueryClient();
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource("/api/stream");
    esRef.current = es;

    es.onmessage = (e: MessageEvent) => {
      try {
        const msg = JSON.parse(e.data as string) as { type: string };

        if (msg.type === "new_event") {
          void queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
          void queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          void queryClient.invalidateQueries({ queryKey: getGetEventTimelineQueryKey() });
          void queryClient.invalidateQueries({ queryKey: getGetEventBreakdownQueryKey() });
          void queryClient.invalidateQueries({ queryKey: getGetCameraHealthQueryKey() });
        }

        if (msg.type === "new_alert") {
          void queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey() });
          void queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        }
      } catch {
      }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      setTimeout(() => {
        esRef.current = new EventSource("/api/stream");
      }, 5000);
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [queryClient]);
}
