import { getStore } from "@netlify/blobs";
import { GUESTS, getGuest, EVENT, POLL_DATES, DATE_STATES, isPollDate, publicMeta } from "./lib/config.mjs";

const STORE = "famfest-inbox";
const keyFor = (slug) => `rsvp:${slug}`;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: CORS });

// Liest den gespeicherten RSVP-Eintrag einer Familie (oder null)
async function readRsvp(store, slug) {
  try {
    const raw = await store.get(keyFor(slug));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Öffentliche Sicht auf eine Familie inkl. RSVP-Status
function mergeGuest(guest, rsvp) {
  const status = rsvp?.status || "offen"; // "zugesagt" | "abgesagt" | "offen"
  const adults = rsvp?.adults ?? null;
  const kids = rsvp?.kids ?? null;
  const count = status === "zugesagt" ? (adults || 0) + (kids || 0) : 0;
  return {
    slug: guest.slug,
    name: guest.name,
    greeting: guest.greeting,
    email: guest.email,
    defaultAdults: guest.defaultAdults ?? 2,
    status,
    adults,
    kids,
    count,
    comment: rsvp?.comment || "",
    dates: rsvp?.dates && typeof rsvp.dates === "object" ? rsvp.dates : {},
    updatedAt: rsvp?.updatedAt || null,
  };
}

export default async (req) => {
  if (req.method === "OPTIONS") return new Response("", { status: 204, headers: CORS });

  const store = getStore(STORE);
  const url = new URL(req.url);

  // ─── GET ────────────────────────────────────────────────
  if (req.method === "GET") {
    const action = url.searchParams.get("action");
    const slug = url.searchParams.get("gast");

    // Admin/Übersicht: alle Familien mit Status + Summen
    if (action === "all") {
      const guests = [];
      let zugesagt = 0, abgesagt = 0, offen = 0, personen = 0;
      // Pro Datum: wie viele Familien passt / vielleicht / passt-nicht / keine Angabe
      const dateStats = POLL_DATES.map((d) => ({
        id: d.id, label: d.label, favorite: !!d.favorite,
        passt: 0, vielleicht: 0, "passt-nicht": 0, keine: 0,
      }));
      for (const g of GUESTS) {
        const rsvp = await readRsvp(store, g.slug);
        const merged = mergeGuest(g, rsvp);
        if (merged.status === "zugesagt") { zugesagt++; personen += merged.count; }
        else if (merged.status === "abgesagt") abgesagt++;
        else offen++;
        for (const ds of dateStats) {
          const v = merged.dates[ds.id];
          if (v === "passt" || v === "vielleicht" || v === "passt-nicht") ds[v]++;
          else ds.keine++;
        }
        guests.push(merged);
      }
      return json({
        ok: true,
        ...publicMeta(),
        guests,
        dateStats,
        totals: { families: GUESTS.length, zugesagt, abgesagt, offen, personen },
      });
    }

    // Persönliche Einladung: eine Familie
    if (slug) {
      const guest = getGuest(slug);
      if (!guest) return json({ ok: false, error: "Gast nicht gefunden" }, 404);
      const rsvp = await readRsvp(store, slug);
      return json({ ok: true, event: EVENT, pollDates: POLL_DATES, guest: mergeGuest(guest, rsvp) });
    }

    return json({ ok: false, error: "Parameter 'gast' oder action=all erforderlich" }, 400);
  }

  // ─── POST: RSVP speichern ───────────────────────────────
  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ ok: false, error: "Ungültiger Request-Body" }, 400);
    }

    const guest = getGuest(body.slug);
    if (!guest) return json({ ok: false, error: "Gast nicht gefunden" }, 404);

    const status = body.status === "zugesagt" || body.status === "abgesagt" ? body.status : null;
    if (!status) return json({ ok: false, error: "Status muss 'zugesagt' oder 'abgesagt' sein" }, 400);

    const clamp = (n, min, max) => Math.max(min, Math.min(max, Math.round(Number(n) || 0)));
    const adults = status === "zugesagt" ? clamp(body.adults ?? guest.defaultAdults, 0, 20) : 0;
    const kids = status === "zugesagt" ? clamp(body.kids ?? 0, 0, 20) : 0;
    const comment = String(body.comment || "").slice(0, 500).trim();

    // Termin-Umfrage: nur bekannte Datums-IDs und erlaubte Zustände übernehmen
    const dates = {};
    if (body.dates && typeof body.dates === "object") {
      for (const [id, val] of Object.entries(body.dates)) {
        if (isPollDate(id) && DATE_STATES.includes(val)) dates[id] = val;
      }
    }

    const record = {
      slug: guest.slug,
      name: guest.name,
      status,
      adults,
      kids,
      comment,
      dates,
      updatedAt: new Date().toISOString(),
    };

    try {
      await store.set(keyFor(guest.slug), JSON.stringify(record));

      // Für den Organisator zusätzlich in die bestehende Inbox spiegeln
      const emoji = status === "zugesagt" ? "✅" : "❌";
      const label = status === "zugesagt" ? "Zusage" : "Absage";
      let desc = `${guest.name}\n\n${emoji} ${label}`;
      if (status === "zugesagt") desc += `\n👥 Personen: ${adults + kids} (${adults} Erw., ${kids} Kinder)`;
      const dateLines = POLL_DATES
        .filter((d) => dates[d.id])
        .map((d) => {
          const sym = dates[d.id] === "passt" ? "✅" : dates[d.id] === "vielleicht" ? "🤔" : "❌";
          return `  ${sym} ${d.label}: ${dates[d.id]}`;
        });
      if (dateLines.length) desc += `\n📅 Termine:\n${dateLines.join("\n")}`;
      if (comment) desc += `\n💬 Bemerkung: ${comment}`;
      await store.set(`ff_rsvp_${guest.slug}`, JSON.stringify({
        id: `ff_rsvp_${guest.slug}`,
        title: `${emoji} ${label}: ${guest.name}`,
        description: desc,
        priority: 2,
        senderApp: "Familienfest Portal",
        senderName: guest.name,
        tags: ["familienfest", "rsvp", status],
        createdAt: record.updatedAt,
        receivedAt: record.updatedAt,
        status: "pending",
        entityType: "task",
        _ffRsvp: record,
      }));
    } catch (e) {
      return json({ ok: false, error: e.message }, 500);
    }

    return json({ ok: true, rsvp: mergeGuest(guest, record) });
  }

  return json({ ok: false, error: "Methode nicht erlaubt" }, 405);
};
