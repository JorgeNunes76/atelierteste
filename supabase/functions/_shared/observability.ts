type LogLevel = "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

function pruneValue(value: unknown): unknown {
  if (value === undefined || value === null) return undefined;

  if (value instanceof Error) {
    return serializeError(value);
  }

  if (Array.isArray(value)) {
    return value.slice(0, 20).map(pruneValue).filter((item) => item !== undefined);
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key, pruneValue(item)] as const)
      .filter(([, item]) => item !== undefined);

    return Object.fromEntries(entries);
  }

  if (typeof value === "string" && value.length > 2000) {
    return `${value.slice(0, 1997)}...`;
  }

  return value;
}

export function createRequestId(): string {
  return crypto.randomUUID();
}

export function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: typeof error === "string" ? error : JSON.stringify(error),
  };
}

export function logEvent(level: LogLevel, event: string, context: LogContext = {}) {
  const payload = pruneValue({
    ts: new Date().toISOString(),
    level,
    event,
    ...context,
  });
  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.info(line);
  }
}

function getSentryEnvelopeUrl(dsn: string): string {
  const parsed = new URL(dsn);
  const pathParts = parsed.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  const projectId = pathParts[pathParts.length - 1];
  const prefixPath = pathParts.slice(0, -1).join("/");
  const basePath = prefixPath ? `/${prefixPath}` : "";
  return `${parsed.protocol}//${parsed.host}${basePath}/api/${projectId}/envelope/`;
}

async function forwardToSentry(params: {
  dsn: string;
  level: LogLevel;
  event: string;
  error: ReturnType<typeof serializeError>;
  context: LogContext;
}) {
  const eventId = createRequestId().replace(/-/g, "");
  const sentAt = new Date().toISOString();
  const environment = Deno.env.get("SENTRY_ENVIRONMENT") ?? Deno.env.get("ENVIRONMENT") ?? "production";
  const envelopeUrl = getSentryEnvelopeUrl(params.dsn);

  const payload = {
    event_id: eventId,
    timestamp: sentAt,
    level: params.level,
    platform: "javascript",
    environment,
    message: params.event,
    exception: {
      values: [
        {
          type: params.error.name ?? "Error",
          value: params.error.message,
          stacktrace: params.error.stack
            ? {
                frames: params.error.stack
                  .split("\n")
                  .slice(0, 30)
                  .map((line) => ({ filename: line.trim() })),
              }
            : undefined,
        },
      ],
    },
    extra: pruneValue(params.context),
    tags: pruneValue({
      source: typeof params.context.source === "string" ? params.context.source : undefined,
      request_id: typeof params.context.request_id === "string" ? params.context.request_id : undefined,
      stripe_session_id: typeof params.context.stripe_session_id === "string" ? params.context.stripe_session_id : undefined,
      venda_id: typeof params.context.venda_id === "string" ? params.context.venda_id : undefined,
    }),
  };

  const envelope = [
    JSON.stringify({ event_id: eventId, sent_at: sentAt, dsn: params.dsn }),
    JSON.stringify({ type: "event" }),
    JSON.stringify(payload),
  ].join("\n");

  await fetch(envelopeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-sentry-envelope" },
    body: envelope,
  });
}

export async function captureException(
  event: string,
  error: unknown,
  context: LogContext = {},
) {
  const serialized = serializeError(error);
  logEvent("error", event, { ...context, error: serialized });

  const dsn = Deno.env.get("SENTRY_DSN");
  if (!dsn) return;

  try {
    await forwardToSentry({
      dsn,
      level: "error",
      event,
      error: serialized,
      context,
    });
  } catch (forwardError) {
    logEvent("warn", "sentry_forward_failed", {
      source: "observability",
      event,
      request_id: typeof context.request_id === "string" ? context.request_id : undefined,
      error: serializeError(forwardError),
    });
  }
}

