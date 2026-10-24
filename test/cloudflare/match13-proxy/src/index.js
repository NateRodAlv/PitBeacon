const ALLOWED_ORIGIN = "https://naterodalv.github.io";
const MATCH13_ORIGIN = "https://actions.match13.com";
const TEAM_SEASON_PATH = /^\/v1\/teams\/\d+\/years\/\d{4}$/;

function responseHeaders(origin, contentType = "application/json; charset=utf-8") {
  const headers = new Headers({
    "Cache-Control": "no-store",
    "Content-Type": contentType,
    Vary: "Origin",
  });
  if (origin === ALLOWED_ORIGIN) {
    headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  }
  return headers;
}

function jsonResponse(status, message, origin) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: responseHeaders(origin),
  });
}

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin");
    if (origin !== ALLOWED_ORIGIN) {
      return jsonResponse(403, "Origin is not allowed.", origin);
    }

    if (request.method === "OPTIONS") {
      const requestedMethod = request.headers.get("Access-Control-Request-Method");
      const requestedHeaders = (request.headers.get("Access-Control-Request-Headers") || "")
        .split(",")
        .map((header) => header.trim().toLowerCase())
        .filter(Boolean);
      if (
        requestedMethod !== "GET" ||
        requestedHeaders.some((header) => header !== "authorization")
      ) {
        return jsonResponse(403, "Preflight request is not allowed.", origin);
      }

      const headers = responseHeaders(origin);
      headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Authorization");
      headers.set("Access-Control-Max-Age", "86400");
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== "GET") {
      return jsonResponse(405, "Only GET requests are allowed.", origin);
    }

    const requestUrl = new URL(request.url);
    if (!TEAM_SEASON_PATH.test(requestUrl.pathname)) {
      return jsonResponse(404, "Unknown Match13 endpoint.", origin);
    }

    const authorization = request.headers.get("Authorization") || "";
    if (!/^Bearer m13_live_\S+$/.test(authorization)) {
      return jsonResponse(401, "A valid Match13 API key is required.", origin);
    }

    try {
      const upstream = await fetch(`${MATCH13_ORIGIN}${requestUrl.pathname}`, {
        headers: {
          Accept: "application/json",
          Authorization: authorization,
        },
      });
      const headers = responseHeaders(
        origin,
        upstream.headers.get("Content-Type") || "application/json; charset=utf-8",
      );
      return new Response(upstream.body, {
        status: upstream.status,
        headers,
      });
    } catch {
      return jsonResponse(502, "Unable to reach Match13.", origin);
    }
  },
};
