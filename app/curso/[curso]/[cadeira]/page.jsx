import Link from "next/link";
import { getCursos, getCadeira } from "../../../../lib/conteudo";

export function generateStaticParams() {
  const out = [];
  for (const c of getCursos()) for (const k of c.cadeiras) out.push({ curso: c.id, cadeira: k.id });
  return out.length ? out : [{ curso: "_", cadeira: "_" }];
}

export default function CadeiraPage({ params }) {
  const found = getCadeira(params.curso, params.cadeira);
  if (!found) return <div className="empty">Cadeira não encontrada.</div>;
  const { curso, cadeira } = found;

  return (
    <>
      <div className="crumbs">
        <Link href="/">Início</Link> / <Link href={`/curso/${curso.id}`}>{curso.titulo}</Link> / {cadeira.titulo}
      </div>
      <h1>{cadeira.titulo}</h1>

      {cadeira.materiais.length > 0 && (
        <>
          <div className="section-label">Material de referência</div>
          <div className="materiais">
            {cadeira.materiais.map((m) => (
              <a key={m.ficheiro} className="mat" href={`/${m.ficheiro}`} target="_blank" rel="noreferrer">
                <span className="ic">▤</span> {m.nome}
              </a>
            ))}
          </div>
        </>
      )}

      <div className="section-label" style={{ marginTop: 34 }}>
        Aulas{cadeira.aulas.length ? ` · ${cadeira.aulas.length}` : ""}
      </div>
      {cadeira.aulas.length === 0 ? (
        <div className="empty">
          Ainda sem aulas. Envia um MP3 em <strong>Enviar aula</strong> e a síntese aparece aqui.
        </div>
      ) : (
        <div className="list">
          {cadeira.aulas.map((aula, i) => (
            <Link key={aula.nome} href={`/curso/${curso.id}/${cadeira.id}/aula/${encodeURIComponent(aula.nome)}`} className="row">
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <span className="grow">
                <div style={{ fontWeight: 600 }}>{aula.titulo}</div>
                <div className="meta">{aula.flashcards.length} flashcard{aula.flashcards.length === 1 ? "" : "s"}</div>
              </span>
              <span className="arrow">→</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
