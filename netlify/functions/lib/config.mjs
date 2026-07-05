// ─────────────────────────────────────────────────────────────
//  Zentrale Konfiguration für das Familienfest-Portal
//  (gemeinsam genutzt von den Netlify-Functions)
// ─────────────────────────────────────────────────────────────

// Quantus-Projekt "Familienfest – Einladungen & Zusagen"
export const PROJECT_ID = "a809ecab-13d2-4b7e-8a8a-5c6fc96df171";
export const PROJECT_EXT_ID = "PRJ-GX5PJ";
export const PROJECT_NAME = "Familienfest – Einladungen & Zusagen";

// Details zum Anlass (Schweizer Rechtschreibung: ss statt ß)
export const EVENT = {
  title: "Familien-Brunch",
  family: "Maag & Rusterholz",
  // Ein Samstag im November 2026 – bei Bedarf hier anpassen.
  date: "Samstag, 21. November 2026",
  time: "ab 10.00 Uhr",
  place: "Wird noch bekannt gegeben",
  intro:
    "Wir laden euch herzlich zu unserem gemeinsamen Familien-Brunch ein. " +
    "Damit wir gut planen können, bitten wir euch um eine kurze Rückmeldung.",
};

// ─── Gästeliste (Seed-Daten) ────────────────────────────────
// slug: eindeutiger, URL-tauglicher Schlüssel für den persönlichen Link
// name: vollständiger Anzeigename
// greeting: persönliche Anrede
// defaultAdults: voreingestellte Anzahl Erwachsene
export const GUESTS = [
  { slug: "beat-gabriela-rusterholz", name: "Beat und Gabriela Rusterholz", greeting: "Liebe Gabriela, lieber Beat", email: "mail@scalabrin.ch", defaultAdults: 2 },
  { slug: "daniel-anita-maag", name: "Daniel und Anita Maag", greeting: "Liebe Anita, lieber Daniel", email: "admaag@yetnet.ch", defaultAdults: 2 },
  { slug: "tobias-dalila-maag", name: "Tobias und Dalila Maag", greeting: "Liebe Dalila, lieber Tobias", email: "tobiasmaag@gmail.com", defaultAdults: 2 },
  { slug: "andy-vroni-rusterholz", name: "Andy und Vroni Rusterholz", greeting: "Liebe Vroni, lieber Andy", email: "a.ru@gmx.ch", defaultAdults: 2 },
  { slug: "ruedi-maag-doris-keist", name: "Ruedi Maag und Doris Keist", greeting: "Liebe Doris, lieber Ruedi", email: "rudolfmaag@bluewin.ch", defaultAdults: 2 },
  { slug: "uschi-willi-maag", name: "Uschi und Willi Maag", greeting: "Liebe Uschi, lieber Willi", email: "uschiwillimaag@bluewin.ch", defaultAdults: 2 },
  { slug: "mathias-yvonne-rusterholz", name: "Mathias und Yvonne Rusterholz", greeting: "Liebe Yvonne, lieber Mathias", email: "mail@mru.ch", defaultAdults: 2 },
  { slug: "fabian-manuela-maag", name: "Fabian und Manuela Maag", greeting: "Liebe Manuela, lieber Fabian", email: "fabian.maag@gmx.ch", defaultAdults: 2 },
  { slug: "stefan-lilian-maag", name: "Stefan und Lilian Maag", greeting: "Liebe Lilian, lieber Stefan", email: "stefan.maag@gmx.ch", defaultAdults: 2 },
  { slug: "marcel-carole-kern-maag", name: "Marcel und Carole Kern-Maag", greeting: "Liebe Carole, lieber Marcel", email: "carolemaag@bluewin.ch", defaultAdults: 2 },
  { slug: "vinci-regula-carrillo-maag", name: "Vinci und Regula Carrillo-Maag", greeting: "Liebe Regula, lieber Vinci", email: "carrillo-maag@gmx.ch", defaultAdults: 2 },
  { slug: "bruno-sibylle-maag", name: "Bruno und Sibylle Maag", greeting: "Liebe Sibylle, lieber Bruno", email: "maagsibylle@hotmail.com", defaultAdults: 2 },
  { slug: "reto-brigitte-maag", name: "Reto und Brigitte Maag", greeting: "Liebe Brigitte, lieber Reto", email: "maagisch@hispeed.ch", defaultAdults: 2 },
  { slug: "ursi-rusterholz", name: "Ursi Rusterholz", greeting: "Liebe Ursi", email: "rusterholz.maag@bluewin.ch", defaultAdults: 1 },
];

export function getGuest(slug) {
  if (!slug) return null;
  return GUESTS.find((g) => g.slug === slug) || null;
}

// Öffentliche Projekt-Infos (ohne interne Details)
export function publicMeta() {
  return {
    project: { id: PROJECT_ID, extId: PROJECT_EXT_ID, name: PROJECT_NAME },
    event: EVENT,
  };
}
