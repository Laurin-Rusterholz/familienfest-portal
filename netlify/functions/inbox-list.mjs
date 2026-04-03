import { getStore } from "@netlify/blobs";

export default async (req) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") return new Response("", { status: 204, headers });

  const store = getStore("famfest-inbox");
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  if (req.method === "POST" && action === "mark") {
    try {
      const { id, status } = await req.json();
      if (!id) return new Response(JSON.stringify({ error: "id required" }), { status: 400, headers });
      const raw = await store.get(id);
      if (raw) {
        const data = JSON.parse(raw);
        data.status = status || "imported";
        data.importedAt = new Date().toISOString();
        await store.set(id, JSON.stringify(data));
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }

  try {
    const { blobs } = await store.list();
    const items = [];
    for (const blob of blobs) {
      try {
        const raw = await store.get(blob.key);
        if (raw) items.push(JSON.parse(raw));
      } catch (e) { /* skip broken entries */ }
    }
    return new Response(JSON.stringify({ submissions: items }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ submissions: [], error: e.message }), { status: 200, headers });
  }
};
