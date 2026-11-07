import { getStore } from "@netlify/blobs";

/** Profilbild nur ausliefern, wenn das Profil im Admin freigegeben ist (pub = true). */
export default async (req) => {
  const u = String(new URL(req.url).searchParams.get("u") || "").toLowerCase();
  if (!/^[a-z0-9_.-]{1,32}$/.test(u)) return new Response("Not found", { status: 404 });
  const prof = await getStore("profiles").get(u, { type: "json" });
  if (!prof?.pub) return new Response("Not found", { status: 404 });
  const m = /^data:image\/jpeg;base64,(.+)$/.exec((await getStore("avatars").get(u)) || "");
  if (!m) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(m[1], "base64"), { headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=300", "x-content-type-options": "nosniff" } });
};

export const config = { path: "/api/avatar" };
