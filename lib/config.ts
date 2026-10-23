// Public settings for the app. The Supabase publishable key is safe to ship in the app:
// row-level security in the database decides what it can read and write.
export const SUPABASE_URL = "https://vfroirrwsxkxebyosdxb.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Yu4IKabwwVHhSA_yNLkbNQ_0bXYbNfQ";

export const TOTAL_DAYS = 315;

export const LINKS = {
  purposePress: "https://example.com/purpose-press", // TODO: Purpose Press website
  substack: "https://purposepress.substack.com",
  substackSubscribe: "https://purposepress.substack.com/subscribe",
};

export const TRANSLATIONS = [
  { code: "NRSVUE", label: "NRSV (Updated)" },
  { code: "NRSV", label: "NRSV" },
  { code: "NIV", label: "NIV" },
  { code: "ESV", label: "ESV" },
  { code: "NLT", label: "NLT" },
  { code: "CEB", label: "CEB" },
  { code: "KJV", label: "KJV" },
  { code: "MSG", label: "The Message" },
];

export const bibleGatewayUrl = (search: string, version: string) =>
  `https://www.biblegateway.com/passage/?search=${encodeURIComponent(search)}&version=${version}`;

export const audioUrl = (path: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/commentary-audio/${path}`;
