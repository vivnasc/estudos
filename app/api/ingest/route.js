// Recebe o URL do áudio (já no Blob) + o curso/cadeira escolhidos e dispara a
// Action "Processar Aulas" no GitHub (workflow_dispatch), que vai buscar o
// áudio, transcreve e faz commit da síntese/flashcards/produto.
//
// O token do GitHub vive só aqui, no servidor — nunca chega ao browser.
import { getCursos, getPartilhada } from "../../../lib/conteudo";

const EXT_AUDIO = /\.(mp3|m4a|wav|mp4|aac|ogg|flac|webm)$/i;

function sanitizarNome(nome) {
  const base = String(nome || "").split(/[\\/]/).pop() || "";
  return base.replace(/[^\w.\- ]+/g, "_").trim();
}

function slug(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const { url, curso, cadeira, filename } = payload || {};

  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    return Response.json({ error: "Falta configurar GITHUB_DISPATCH_TOKEN no servidor." }, { status: 500 });
  }
  if (!url || typeof url !== "string" || !url.startsWith("https://")) {
    return Response.json({ error: "URL do áudio em falta." }, { status: 400 });
  }

  const nomeFicheiro = sanitizarNome(filename);
  if (!EXT_AUDIO.test(nomeFicheiro)) {
    return Response.json({ error: "Ficheiro não é áudio reconhecido." }, { status: 400 });
  }

  // Constrói o caminho de destino (cadeira), validando contra o conteúdo real.
  let areaDir;
  let destinoTitulo;
  const partilhada = getPartilhada();
  if (partilhada && curso === partilhada.id) {
    areaDir = "disciplina-partilhada";
    destinoTitulo = partilhada.titulo;
  } else {
    const c = getCursos().find((x) => x.id === curso);
    if (!c) return Response.json({ error: "Curso desconhecido." }, { status: 400 });

    let cadId;
    const existente = c.cadeiras.find((k) => k.id === cadeira || k.titulo === cadeira);
    if (existente) {
      cadId = existente.id;
    } else {
      const s = slug(cadeira);
      if (!s) return Response.json({ error: "Indica a cadeira." }, { status: 400 });
      const idx = String(c.cadeiras.length + 1).padStart(2, "0");
      cadId = `${idx}-${s}`;
    }
    areaDir = `cursos/${c.id}/${cadId}`;
    destinoTitulo = `${c.titulo} · ${existente ? existente.titulo : cadeira}`;
  }

  const repo = process.env.GH_REPO || "vivnasc/syntia";
  const ref = process.env.GH_BRANCH || "main";

  const resp = await fetch(
    `https://api.github.com/repos/${repo}/actions/workflows/processar.yml/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref,
        inputs: { audio_url: url, curso: areaDir, filename: nomeFicheiro },
      }),
    }
  );

  if (resp.status !== 204) {
    const texto = await resp.text();
    return Response.json(
      { error: `GitHub recusou o disparo (${resp.status}): ${texto.slice(0, 300)}` },
      { status: 502 }
    );
  }

  return Response.json({ ok: true, destino: destinoTitulo, filename: nomeFicheiro });
}
