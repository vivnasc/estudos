import Link from "next/link";
import { getCursos, getPartilhada, getBanco, getTemas } from "../lib/conteudo";

const COR_TEMA = {
  corpo: "var(--corpo)",
  amor: "var(--amor)",
  maternidade: "var(--maternidade)",
  prosperidade: "var(--prosperidade)",
};

function contarAulas(curso) {
  return curso.cadeiras.reduce((n, k) => n + k.aulas.length, 0);
}
function contarFlash(curso) {
  return curso.cadeiras.reduce((n, k) => n + k.aulas.reduce((m, a) => m + a.flashcards.length, 0), 0);
}

export default function Home() {
  const cursos = getCursos();
  const partilhada = getPartilhada();
  const banco = getBanco();
  const temas = getTemas();

  const totalAulas = cursos.reduce((s, c) => s + contarAulas(c), 0) + (partilhada?.aulas.length || 0);
  const totalFlash =
    cursos.reduce((s, c) => s + contarFlash(c), 0) +
    (partilhada?.aulas.reduce((m, a) => m + a.flashcards.length, 0) || 0);
  const totalCadeiras = cursos.reduce((s, c) => s + c.cadeiras.length, 0) + (partilhada ? 1 : 0);

  const maxAulas = Math.max(
    1,
    ...cursos.map(contarAulas),
    partilhada ? partilhada.aulas.length : 0
  );
  const temaCount = Object.fromEntries(temas.map((t) => [t, banco.filter((it) => it.temas.includes(t)).length]));

  const linhas = [
    ...cursos.map((c) => ({ href: `/curso/${c.id}`, titulo: c.titulo, n: contarAulas(c), sub: `${c.cadeiras.length} cadeira${c.cadeiras.length === 1 ? "" : "s"}` })),
    ...(partilhada ? [{ href: "/partilhada", titulo: partilhada.titulo, n: partilhada.aulas.length, sub: "comum aos 3" }] : []),
  ];

  return (
    <>
      <h1>O teu painel</h1>
      <p className="lead">
        Onde está o teu estudo num relance. Escolhe um curso na barra ao lado, ou
        envia uma aula nova — a cadeira certa é populada sozinha.
      </p>

      <div className="stats">
        <div className="stat"><div className="n">{totalAulas}</div><div className="l">aulas processadas</div></div>
        <div className="stat"><div className="n">{totalCadeiras}</div><div className="l">cadeiras</div></div>
        <div className="stat"><div className="n">{totalFlash}</div><div className="l">flashcards</div></div>
        <div className="stat"><div className="n">{banco.length}</div><div className="l">ideias de produto</div></div>
      </div>

      <div className="section-label" style={{ marginTop: 34 }}>Progresso por curso</div>
      <div className="prog">
        {linhas.map((l) => (
          <Link key={l.href} href={l.href} className="prog-row">
            <div className="prog-head">
              <span className="t">{l.titulo}</span>
              <span className="c">{l.n === 0 ? `por começar · ${l.sub}` : `${l.n} aula${l.n === 1 ? "" : "s"} · ${l.sub}`}</span>
            </div>
            <div className="bar"><span style={{ width: `${Math.round((l.n / maxAulas) * 100)}%` }} /></div>
          </Link>
        ))}
      </div>

      <div className="section-label" style={{ marginTop: 34 }}>Cobertura por tema · Banco de Produto</div>
      <div className="temas-cov">
        {temas.map((t) => (
          <Link key={t} href="/produto" className="tcov">
            <span className="dot" style={{ background: COR_TEMA[t] }} />
            <span className="nm">{t}</span>
            {temaCount[t] > 0 ? <span className="v">{temaCount[t]}</span> : <span className="v zero">a explorar</span>}
          </Link>
        ))}
      </div>

      <div className="footer">PWA instalável · conteúdo gerado a partir do repositório</div>
    </>
  );
}
