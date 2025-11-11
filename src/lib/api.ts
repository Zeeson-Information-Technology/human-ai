export class ApiError extends Error {
  status?: number;
  id?: string;
  body?: any;
  constructor(message: string, opts?: { status?: number; id?: string; body?: any }) {
    super(message);
    this.name = "ApiError";
    this.status = opts?.status;
    this.id = opts?.id;
    this.body = opts?.body;
  }
}

type FetchInit = RequestInit & { retries?: number; retryDelayMs?: number };

export async function apiFetch<T = any>(url: string, init?: FetchInit): Promise<T> {
  const retries = init?.retries ?? 1;
  const retryDelayMs = init?.retryDelayMs ?? 600;

  let attempt = 0;
  // Always send JSON if body is an object and Content-Type isn't set
  const headers = new Headers(init?.headers || {});
  const isJsonBody = init?.body && typeof init.body !== "string" && !(init.body instanceof FormData);
  if (isJsonBody && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const reqInit: RequestInit = { ...init, headers };
  if (isJsonBody) reqInit.body = JSON.stringify(init?.body);

  while (true) {
    try {
      const res = await fetch(url, reqInit);
      let data: any = null;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const txt = await res.text();
        try {
          data = JSON.parse(txt);
        } catch {
          data = txt;
        }
      }

      // If API returns { ok: false }, throw a structured error
      if (data && typeof data === "object" && "ok" in data && data.ok === false) {
        const msg = data.error || `Request failed`;
        throw new ApiError(msg, { status: res.status, id: data.id, body: data });
      }

      if (!res.ok) {
        const msg = (data && data.error) || res.statusText || "Request failed";
        throw new ApiError(msg, { status: res.status, body: data });
      }
      return data as T;
    } catch (e: any) {
      const isNetwork = e?.name === "TypeError" || e?.message?.includes("Failed to fetch");
      const shouldRetry = attempt < retries && (isNetwork || (e?.status && e.status >= 500));
      if (!shouldRetry) {
        if (e instanceof ApiError) throw e;
        throw new ApiError(e?.message || "Network error");
      }
      await new Promise((r) => setTimeout(r, retryDelayMs * (attempt + 1)));
      attempt += 1;
    }
  }
}

export function normalizeError(err: unknown): { message: string; id?: string } {
  if (err instanceof ApiError) return { message: err.message, id: err.id };
  if (err && typeof err === "object" && "message" in err) return { message: (err as any).message };
  return { message: "Unexpected error" };
}

