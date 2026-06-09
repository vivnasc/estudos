// Conversor mínimo de Markdown -> blocos estruturados, para depois desenhar no
// PDF (react-pdf não percebe markdown nem HTML). Cobre o que os resumos e
// objetivos realmente usam: títulos (#..####), parágrafos, listas (- e 1.),
// tabelas estilo GitHub (| ... | com linha ---), citações (>), régua (---) e
// formatação inline **negrito**, *itálico* e `código`.

function parseInline(text) {
  const runs = [];
  const re = /(\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\n]+)\*|_([^_\n]+)_|`([^`]+)`)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) runs.push({ text: text.slice(last, m.index) });
    if (m[2] != null) runs.push({ text: m[2], bold: true });
    else if (m[3] != null) runs.push({ text: m[3], bold: true });
    else if (m[4] != null) runs.push({ text: m[4], italic: true });
    else if (m[5] != null) runs.push({ text: m[5], italic: true });
    else if (m[6] != null) runs.push({ text: m[6], code: true });
    last = re.lastIndex;
  }
  if (last < text.length) runs.push({ text: text.slice(last) });
  return runs.length ? runs : [{ text: text || "" }];
}

function splitRow(line) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

const RE_BLOCK_START = /^(#{1,6}\s|>\s?|\s*[-*+]\s+|\s*\d+[.)]\s+|---+\s*$)/;

export function parseMarkdown(md) {
  const lines = (md || "").replace(/\r/g, "").split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    // Régua horizontal
    if (/^---+\s*$/.test(line.trim())) { blocks.push({ type: "hr" }); i++; continue; }

    // Título
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { blocks.push({ type: "h", level: h[1].length, runs: parseInline(h[2].trim()) }); i++; continue; }

    // Tabela: linha com | seguida de separador |---|
    if (line.includes("|") && i + 1 < lines.length &&
        /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) && lines[i + 1].includes("-")) {
      const header = splitRow(line).map(parseInline);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
        rows.push(splitRow(lines[i]).map(parseInline));
        i++;
      }
      blocks.push({ type: "table", header, rows });
      continue;
    }

    // Citação
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
      blocks.push({ type: "quote", runs: parseInline(buf.join(" ")) });
      continue;
    }

    // Lista não ordenada
    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(parseInline(lines[i].replace(/^\s*[-*+]\s+/, "")));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Lista ordenada
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(parseInline(lines[i].replace(/^\s*\d+[.)]\s+/, "")));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // Parágrafo (junta linhas até quebra/bloco novo)
    const buf = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !RE_BLOCK_START.test(lines[i]) && !lines[i].includes("|")) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push({ type: "p", runs: parseInline(buf.join(" ")) });
  }
  return blocks;
}
