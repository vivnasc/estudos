"use client";

import {
  Document, Page, Text, View, StyleSheet, PDFViewer, PDFDownloadLink,
} from "@react-pdf/renderer";
import { parseMarkdown } from "./mdToPdf";

// Paleta sóbria, tipo apostila impressa.
const GOLD = "#6b4f1d";
const INK = "#1a1a1a";
const SOFT = "#555555";
const LINE = "#cfc7b8";

const s = StyleSheet.create({
  page: { paddingTop: 48, paddingBottom: 56, paddingHorizontal: 54, fontFamily: "Helvetica", fontSize: 10.5, color: INK, lineHeight: 1.5 },

  // Capa
  cover: { flexGrow: 1, justifyContent: "center" },
  coverCurso: { fontFamily: "Helvetica-Bold", fontSize: 11, color: GOLD, letterSpacing: 1, textTransform: "uppercase" },
  coverTitulo: { fontFamily: "Times-Bold", fontSize: 30, marginTop: 10, marginBottom: 10, lineHeight: 1.15 },
  coverRule: { borderBottomWidth: 2, borderBottomColor: GOLD, width: 90, marginBottom: 16 },
  coverSub: { fontSize: 10, color: SOFT },
  coverEmentaLabel: { marginTop: 30, fontFamily: "Helvetica-Bold", fontSize: 9, color: SOFT, letterSpacing: 1, textTransform: "uppercase" },
  coverEmentaItem: { fontSize: 10.5, color: INK, marginTop: 4, paddingLeft: 10 },

  // Cabeçalho de unidade
  uniHead: { fontFamily: "Times-Bold", fontSize: 20, color: INK, marginBottom: 4 },
  uniRule: { borderBottomWidth: 1, borderBottomColor: LINE, marginBottom: 14 },
  secLabel: { fontFamily: "Helvetica-Bold", fontSize: 12, color: GOLD, marginTop: 14, marginBottom: 6 },

  // Markdown
  h1: { fontFamily: "Times-Bold", fontSize: 15, marginTop: 12, marginBottom: 5 },
  h2: { fontFamily: "Times-Bold", fontSize: 13, marginTop: 10, marginBottom: 4 },
  h3: { fontFamily: "Helvetica-Bold", fontSize: 11.5, marginTop: 9, marginBottom: 3 },
  h4: { fontFamily: "Helvetica-Bold", fontSize: 10.5, marginTop: 8, marginBottom: 3, color: SOFT },
  p: { marginBottom: 6, textAlign: "justify" },
  b: { fontFamily: "Helvetica-Bold" },
  i: { fontFamily: "Helvetica-Oblique" },
  code: { fontFamily: "Courier", fontSize: 9.5 },
  hr: { borderBottomWidth: 1, borderBottomColor: LINE, marginVertical: 8 },
  quote: { borderLeftWidth: 3, borderLeftColor: GOLD, paddingLeft: 10, marginVertical: 6 },
  quoteText: { color: SOFT, fontFamily: "Helvetica-Oblique" },

  list: { marginBottom: 6 },
  li: { flexDirection: "row", marginBottom: 2.5 },
  bullet: { width: 16, color: GOLD },
  liText: { flex: 1 },

  // Tabela
  table: { marginVertical: 8, borderWidth: 1, borderColor: LINE },
  trow: { flexDirection: "row" },
  thead: { backgroundColor: "#f3efe6" },
  cell: { padding: 5, borderRightWidth: 1, borderBottomWidth: 1, borderColor: LINE },
  thText: { fontFamily: "Helvetica-Bold", fontSize: 9.5 },
  tdText: { fontSize: 9.5 },

  // Aulas
  aulaItem: { flexDirection: "row", marginBottom: 3 },
  aulaNum: { width: 18, color: GOLD, fontFamily: "Helvetica-Bold" },
  aulaText: { flex: 1 },
  aulaMeta: { color: SOFT },

  pageNum: { position: "absolute", bottom: 28, left: 54, right: 54, textAlign: "center", fontSize: 8.5, color: SOFT },
  footRule: { position: "absolute", bottom: 42, left: 54, right: 54, borderBottomWidth: 0.5, borderBottomColor: LINE },
});

function Runs({ runs, style }) {
  return (
    <Text style={style}>
      {runs.map((r, i) => {
        const st = [];
        if (r.bold) st.push(s.b);
        if (r.italic) st.push(s.i);
        if (r.code) st.push(s.code);
        return st.length ? <Text key={i} style={st}>{r.text}</Text> : r.text;
      })}
    </Text>
  );
}

function Table({ b }) {
  const cols = Math.max(1, b.header.length);
  const w = `${100 / cols}%`;
  const Row = ({ cells, head }) => (
    <View style={[s.trow, head ? s.thead : null]} wrap={false}>
      {Array.from({ length: cols }).map((_, ci) => (
        <View key={ci} style={[s.cell, { width: w }]}>
          <Runs runs={cells[ci] || [{ text: "" }]} style={head ? s.thText : s.tdText} />
        </View>
      ))}
    </View>
  );
  return (
    <View style={s.table}>
      <Row cells={b.header} head />
      {b.rows.map((r, ri) => <Row key={ri} cells={r} />)}
    </View>
  );
}

function Block({ b }) {
  switch (b.type) {
    case "h": {
      const st = b.level <= 1 ? s.h1 : b.level === 2 ? s.h2 : b.level === 3 ? s.h3 : s.h4;
      return <Runs runs={b.runs} style={st} />;
    }
    case "p": return <Runs runs={b.runs} style={s.p} />;
    case "hr": return <View style={s.hr} />;
    case "quote": return <View style={s.quote}><Runs runs={b.runs} style={s.quoteText} /></View>;
    case "ul":
      return (
        <View style={s.list}>
          {b.items.map((it, i) => (
            <View key={i} style={s.li}><Text style={s.bullet}>•</Text><Runs runs={it} style={s.liText} /></View>
          ))}
        </View>
      );
    case "ol":
      return (
        <View style={s.list}>
          {b.items.map((it, i) => (
            <View key={i} style={s.li}><Text style={s.bullet}>{i + 1}.</Text><Runs runs={it} style={s.liText} /></View>
          ))}
        </View>
      );
    case "table": return <Table b={b} />;
    default: return null;
  }
}

function Markdown({ md }) {
  return <>{parseMarkdown(md).map((b, i) => <Block key={i} b={b} />)}</>;
}

function ManualDoc({ curso, cadeira, unidades, hoje }) {
  return (
    <Document title={`${cadeira.titulo} — Manual`} author="SyntIA">
      {/* Capa */}
      <Page size="A4" style={s.page}>
        <View style={s.cover}>
          <Text style={s.coverCurso}>{curso.titulo}</Text>
          <Text style={s.coverTitulo}>{cadeira.titulo}</Text>
          <View style={s.coverRule} />
          <Text style={s.coverSub}>Manual de estudo · gerado a {hoje}</Text>
          {cadeira.ementa?.length > 0 && (
            <View>
              <Text style={s.coverEmentaLabel}>No programa</Text>
              {cadeira.ementa.map((t, i) => <Text key={i} style={s.coverEmentaItem}>•  {t}</Text>)}
            </View>
          )}
        </View>
      </Page>

      {/* Uma unidade por página (quebra automática se transbordar) */}
      {unidades.map((u) => (
        <Page key={u.n} size="A4" style={s.page}>
          <Text style={s.uniHead}>U{u.n} · {u.titulo}</Text>
          <View style={s.uniRule} />

          {u.objetivos ? (<><Text style={s.secLabel}>Objetivos da unidade</Text><Markdown md={u.objetivos} /></>) : null}
          {u.resumo ? (<><Text style={s.secLabel}>Resumo da unidade</Text><Markdown md={u.resumo} /></>) : null}

          {u.aulas?.length > 0 && (
            <>
              <Text style={s.secLabel}>Aulas desta unidade</Text>
              {u.aulas.map((a, i) => (
                <View key={i} style={s.aulaItem}>
                  <Text style={s.aulaNum}>{i + 1}.</Text>
                  <Text style={s.aulaText}>
                    {a.titulo}
                    {a.flashcards ? <Text style={s.aulaMeta}>  ·  {a.flashcards} flashcards</Text> : null}
                  </Text>
                </View>
              ))}
            </>
          )}

          <View style={s.footRule} fixed />
          <Text style={s.pageNum} fixed render={({ pageNumber, totalPages }) => `${curso.titulo} · ${cadeira.titulo}     ${pageNumber} / ${totalPages}`} />
        </Page>
      ))}
    </Document>
  );
}

export default function ManualPDF(props) {
  const doc = <ManualDoc {...props} />;
  const ficheiro = `${props.cadeira.titulo}.pdf`.replace(/[\\/:*?"<>|]+/g, " ").trim();

  return (
    <div className="pdf-wrap">
      <div className="pdf-bar no-print">
        <PDFDownloadLink document={doc} fileName={ficheiro} className="btn-imprimir">
          {({ loading }) => (loading ? "A preparar…" : "⬇  Descarregar PDF")}
        </PDFDownloadLink>
      </div>
      <PDFViewer showToolbar style={{ width: "100%", height: "82vh", border: "none", borderRadius: 10 }}>
        {doc}
      </PDFViewer>
    </div>
  );
}
