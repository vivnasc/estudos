import Link from "next/link";
import { getCursos, getCurso } from "../../../lib/conteudo";

export function generateStaticParams() {
  const ids = getCursos().map((c) => ({ curso: c.id }));
  return ids.length ? ids : [{ curso: "_" }];
}

export default function CursoPage({ params }) {
  const curso = getCurso(params.curso);
  if (!curso) return <div className="empty">Curso não encontrado.</div>;

  return (
    <>
      <div className="crumbs">
        <Link href="/">Início</Link> / {curso.titulo}
      </div>
      <h1>{curso.titulo}</h1>

      {curso.materiais.length > 0 && (
        <>
          <div className="section-label">Programa do curso</div>
          <div className="materiais">
            {curso.materiais.map((m) => (
              <a key={m.ficheiro} className="mat" href={`/${m.ficheiro}`} target="_blank" rel="noreferrer">
                <span className="ic">▤</span> {m.nome}
              </a>
            ))}
          </div>
        </>
      )}

      <div className="section-label" style={{ marginTop: 34 }}>
        Cadeiras{curso.cadeiras.length ? ` · ${curso.cadeiras.length}` : ""}
      </div>
      {curso.cadeiras.length === 0 ? (
        <div className="empty">
          Ainda sem cadeiras. Quando uma abrir, envia a 1ª aula em <strong>Enviar aula</strong>
          {" "}e a cadeira é criada automaticamente.
        </div>
      ) : (
        <div className="list">
          {curso.cadeiras.map((k, i) => (
            <Link key={k.id} href={`/curso/${curso.id}/${k.id}`} className="row">
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <span className="grow">
                <div style={{ fontWeight: 600 }}>{k.titulo}</div>
                <div className="meta">{k.aulas.length} aula{k.aulas.length === 1 ? "" : "s"}</div>
              </span>
              <span className="arrow">→</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
