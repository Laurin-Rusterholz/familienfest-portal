import { getStore } from "@netlify/blobs";

const KEY = "portal-updates";

export default async (req) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") return new Response("", { status: 204, headers });

  const store = getStore("famfest-inbox");

  if (req.method === "GET") {
    try {
      const raw = await store.get(KEY);
      const data = raw ? JSON.parse(raw) : { updates: [] };
      return new Response(JSON.stringify(data), { status: 200, headers });
    } catch (e) {
      return new Response(JSON.stringify({ updates: [] }), { status: 200, headers });
    }
  }

  if (req.method === "DELETE") {
    try {
      await store.set(KEY, JSON.stringify({ updates: [] }));
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const raw = await store.get(KEY);
      const data = raw ? JSON.parse(raw) : { updates: [] };

      if (body.action === "remove" && body.id) {
        data.updates = data.updates.filter(u => u.id !== body.id);
      } else if (body.text) {
        data.updates.push({
          id: Math.random().toString(36).slice(2, 10),
          text: body.text,
          createdAt: new Date().toISOString(),
        });
      }

      await store.set(KEY, JSON.stringify(data));
      return new Response(JSON.stringify({ ok: true, updates: data.updates }), { status: 200, headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
};
