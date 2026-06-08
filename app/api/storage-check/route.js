// Diagnóstico do Supabase Storage. Abre /api/storage-check no browser: grava
// um ficheiro de teste no servidor e diz, em português simples, se está tudo
// bem ou o que falta.
import { createClient } from "@supabase/supabase-js";

const BUCKET = "aulas";

function pagina(emoji, titulo, detalhe, cor) {
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
     <body style="font-family:system-ui;background:#15110d;color:#eee;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:24px">
       <div style="max-width:560px;text-align:center">
         <div style="font-size:54px">${emoji}</div>
         <h1 style="color:${cor};font-size:22px;margin:12px 0">${titulo}</h1>
         <p style="color:#bbb;line-height:1.5;font-size:15px">${detalhe}</p>
       </div>
     </body>`,
    { headers: { "content-type": "text/html; charset=utf-8" } }
  );
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const faltam = [];
  if (!url) faltam.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!anon) faltam.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!serviceKey) faltam.push("SUPABASE_SERVICE_ROLE_KEY");
  if (faltam.length) {
    return pagina("❌", "Faltam variáveis do Supabase", `Ainda não estão configuradas na Vercel: <b>${faltam.join(", ")}</b>. Adiciona-as e faz Redeploy.`, "#e57373");
  }

  try {
    const supa = createClient(url, serviceKey, { auth: { persistSession: false } });
    const erroBucket = (await supa.storage.createBucket(BUCKET, { public: true })).error;
    // erro "already exists" é normal e bom — ignora-se.
    if (erroBucket && !/exist/i.test(erroBucket.message)) throw erroBucket;

    const caminho = `diagnostico/check-${Date.now()}.txt`;
    const up = await supa.storage.from(BUCKET).upload(caminho, "ok", { contentType: "text/plain", upsert: true });
    if (up.error) throw up.error;

    const publicUrl = `${url.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${caminho}`;
    return pagina(
      "✅",
      "Supabase a funcionar!",
      `Gravei um ficheiro de teste no bucket <b>aulas</b> (público). O envio de aulas vai funcionar — volta à página de envio e manda um MP3.<br><br><span style="font-size:12px;color:#777">${publicUrl}</span>`,
      "#81c784"
    );
  } catch (e) {
    return pagina(
      "⚠️",
      "Supabase configurado mas deu erro",
      `Resposta: <b>${(e?.message || "erro desconhecido").replace(/</g, "&lt;")}</b>.<br><br>Copia esta mensagem e manda-ma.`,
      "#ffb74d"
    );
  }
}
