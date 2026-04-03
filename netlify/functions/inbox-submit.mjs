import { getStore } from "@netlify/blobs";

export default async (req) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") return new Response("", { status: 204, headers });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers });

  try {
    const body = await req.json();
    if (!body.id) return new Response(JSON.stringify({ error: "id required" }), { status: 400, headers });

    const store = getStore("famfest-inbox");
    body.receivedAt = new Date().toISOString();
    await store.set(body.id, JSON.stringify(body));

    return new Response(JSON.stringify({ ok: true, id: body.id }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
};
