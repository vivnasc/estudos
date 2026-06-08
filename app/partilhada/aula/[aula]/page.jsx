import Link from "next/link";
import Markdown from "../../../Markdown";
import Flashcards from "../../../Flashcards";
import { getPartilhada, getAulaPartilhada } from "../../../../lib/conteudo";

export function generateStaticParams() {
  const p = getPartilhada();
  const out = (p?.aulas || []).map((a) => ({ aula: a.nome }));
  return out.length ? out : [{ aula: "_" }];
}

export default function AulaPartilhadaPage({ params }) {
  const nome = decodeURIComponent(params.aula);
  const found = getAulaPartilhada(nome);
  if (!found) return <div className="empty">Aula não encontrada.</div>;
  const { partilhada, aula } = found;

  return (
    <>
      <div className="crumbs">
        <Link href="/">Início</Link> / <Link href="/partilhada">{partilhada.titulo}</Link> / {aula.titulo}
      </div>
      <h1>{aula.titulo}</h1>

      <Flashcards cards={aula.flashcards} />

      <div className="section-label" style={{ marginTop: 36 }}>Síntese de estudo</div>
      <Markdown>{aula.sintese}</Markdown>

      <div className="footer">
        <Link href="/partilhada">← voltar a {partilhada.titulo}</Link>
      </div>
    </>
  );
}
