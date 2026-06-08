import Link from "next/link";
import Markdown from "../../../../../Markdown";
import Flashcards from "../../../../../Flashcards";
import { getCursos, getAulaCurso } from "../../../../../../lib/conteudo";

export function generateStaticParams() {
  const out = [];
  for (const c of getCursos())
    for (const k of c.cadeiras)
      for (const a of k.aulas) out.push({ curso: c.id, cadeira: k.id, aula: a.nome });
  return out.length ? out : [{ curso: "_", cadeira: "_", aula: "_" }];
}

export default function AulaPage({ params }) {
  const curso = decodeURIComponent(params.curso);
  const cadeira = decodeURIComponent(params.cadeira);
  const nome = decodeURIComponent(params.aula);
  const found = getAulaCurso(curso, cadeira, nome);
  if (!found) return <div className="empty">Aula não encontrada.</div>;
  const { curso: c, cadeira: k, aula } = found;

  return (
    <>
      <div className="crumbs">
        <Link href="/">Início</Link> / <Link href={`/curso/${c.id}`}>{c.titulo}</Link> /{" "}
        <Link href={`/curso/${c.id}/${k.id}`}>{k.titulo}</Link> / {aula.titulo}
      </div>
      <h1>{aula.titulo}</h1>

      <Flashcards cards={aula.flashcards} />

      <div className="section-label" style={{ marginTop: 36 }}>Síntese de estudo</div>
      <Markdown>{aula.sintese}</Markdown>

      <div className="footer">
        <Link href={`/curso/${c.id}/${k.id}`}>← voltar a {k.titulo}</Link>
      </div>
    </>
  );
}
