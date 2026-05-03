const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const OBSERVABILITY_MARKER = "__reported_client_error_request_id";

type ErrorContext = {
  source: string;
  requestId?: string;
  route?: string;
  tags?: Record<string, unknown>;
  context?: Record<string, unknown>;
  componentStack?: string;
};

type ClientErrorPayload = {
  source: string;
  message: string;
  stack?: string;
  route: string;
  request_id: string;
  client_session_id: string;
  component_stack?: string;
  tags?: Record<string, unknown>;
  context?: Record<string, unknown>;
};

function createClientRequestId(): string {
  return crypto.randomUUID();
}

function getClientSessionId(): string {
  const fallback = createClientRequestId();
  try {
    const existing = window.sessionStorage.getItem("client_session_id");
    if (existing) return existing;
    window.sessionStorage.setItem("client_session_id", fallback);
    return fallback;
  } catch {
    return fallback;
  }
}

function currentRoute(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof error === "string") {
    return { message: error };
  }

  return { message: "Erro desconhecido no browser." };
}

function canSendTelemetry(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

function postClientError(payload: ClientErrorPayload) {
  if (!canSendTelemetry()) return;

  const endpoint = `${supabaseUrl}/functions/v1/report-client-error`;
  const body = JSON.stringify(payload);

  try {
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // No-op: observability nunca deve quebrar a UX.
  }
}

export function captureClientError(error: unknown, details: ErrorContext) {
  if (error && typeof error === "object") {
    const existingRequestId = (error as Record<string, unknown>)[OBSERVABILITY_MARKER];
    if (typeof existingRequestId === "string") {
      return existingRequestId;
    }
  }

  const serialized = serializeError(error);
  const requestId = details.requestId ?? createClientRequestId();

  if (error && typeof error === "object") {
    (error as Record<string, unknown>)[OBSERVABILITY_MARKER] = requestId;
  }

  if (import.meta.env.DEV) {
    console.error("[observability]", details.source, serialized.message, details);
  }

  postClientError({
    source: details.source,
    message: serialized.message,
    stack: serialized.stack,
    route: details.route ?? currentRoute(),
    request_id: requestId,
    client_session_id: getClientSessionId(),
    component_stack: details.componentStack,
    tags: details.tags,
    context: details.context,
  });

  return requestId;
}

let initialized = false;

export function initClientObservability() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  window.addEventListener("error", (event) => {
    captureClientError(event.error ?? new Error(event.message), {
      source: "window.error",
      context: {
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
      },
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    captureClientError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)), {
      source: "window.unhandledrejection",
    });
  });
}
