import Link from "next/link";
import { getPartilhada } from "../../lib/conteudo";

export const metadata = { title: "Disciplina Partilhada — SyntIA" };

export default function PartilhadaPage() {
  const p = getPartilhada();
  if (!p) return <div className="empty">Sem disciplina partilhada.</div>;

  return (
    <>
      <div className="crumbs">
        <Link href="/">Início</Link> / {p.titulo}
      </div>
      <h1>{p.titulo}</h1>
      <p className="lead">Comum às três pós-graduações — guardada num só sítio, nunca duplicada.</p>

      {p.materiais.length > 0 && (
        <>
          <div className="section-label">Material de referência</div>
          <div className="materiais">
            {p.materiais.map((m) => (
              <a key={m.ficheiro} className="mat" href={`/${m.ficheiro}`} target="_blank" rel="noreferrer">
                <span className="ic">▤</span> {m.nome}
              </a>
            ))}
          </div>
        </>
      )}

      <div className="section-label" style={{ marginTop: 34 }}>
        Aulas{p.aulas.length ? ` · ${p.aulas.length}` : ""}
      </div>
      {p.aulas.length === 0 ? (
        <div className="empty">
          Ainda sem aulas. Envia um MP3 em <strong>Enviar aula</strong> (escolhe a disciplina partilhada).
        </div>
      ) : (
        <div className="list">
          {p.aulas.map((aula, i) => (
            <Link key={aula.nome} href={`/partilhada/aula/${encodeURIComponent(aula.nome)}`} className="row">
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
