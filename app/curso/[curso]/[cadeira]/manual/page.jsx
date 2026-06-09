import Link from "next/link";
import { getCursos, getCadeira } from "../../../../../lib/conteudo";
import Markdown from "../../../../Markdown";
import ImprimirBtn from "../../../../ImprimirBtn";

export function generateStaticParams() {
  const out = [];
  for (const c of getCursos())
    for (const k of c.cadeiras)
      if (!k.partilhada) out.push({ curso: c.id, cadeira: k.id });
  return out.length ? out : [{ curso: "_", cadeira: "_" }];
}

// Manual imprimível de uma cadeira: um documento de estudo legível, não um
// despejo. Por unidade mostra os objetivos + o resumo condensado + a lista das
// aulas que a compõem. As sínteses completas e os flashcards NÃO entram aqui —
// vivem nas vistas de estudo por aula, para o manual não virar uma parede de
// texto impossível de ler. Pensado para "Guardar como PDF" no navegador.
export default function ManualPage({ params }) {
  const found = getCadeira(params.curso, params.cadeira);
  if (!found) return <div className="empty">Disciplina não encontrada.</div>;
  const { curso, cadeira } = found;

  const unidades = (cadeira.unidades || []).filter((u) => u.aulas.length > 0 || u.objetivos || u.resumo);
  const hoje = new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="manual">
      <div className="manual-barra no-print">
        <Link href={`/curso/${curso.id}/${cadeira.id}`}>← voltar à disciplina</Link>
        <ImprimirBtn />
      </div>

      {/* Capa */}
      <header className="manual-capa">
        <div className="manual-curso">{curso.titulo}</div>
        <h1 className="manual-titulo">{cadeira.titulo}</h1>
        <div className="manual-sub">Manual de estudo · gerado a {hoje}</div>
        {cadeira.ementa?.length > 0 && (
          <div className="manual-ementa">
            <div className="section-label">No programa</div>
            <ul>{cadeira.ementa.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>
        )}
      </header>

      {unidades.length === 0 && (
        <p className="empty">Esta disciplina ainda não tem conteúdo para compilar.</p>
      )}

      {unidades.map((u) => (
        <section key={u.n} className="manual-unidade">
          <h2 className="manual-uni-cab">
            <span className="manual-uni-n">U{u.n}</span> {u.titulo}
          </h2>

          {u.objetivos && (
            <div className="manual-bloco">
              <h3>🎯 Objetivos da unidade</h3>
              <Markdown>{u.objetivos}</Markdown>
            </div>
          )}

          {u.resumo && (
            <div className="manual-bloco">
              <h3>📘 Resumo da unidade</h3>
              <Markdown>{u.resumo}</Markdown>
            </div>
          )}

          {u.aulas.length > 0 && (
            <div className="manual-bloco manual-aulas-lista">
              <h3>📚 Aulas desta unidade</h3>
              <p className="manual-aulas-nota no-print">
                A síntese completa e os flashcards de cada aula ficam na vista de estudo da disciplina.
              </p>
              <ol>
                {u.aulas.map((aula) => (
                  <li key={aula.nome}>
                    {aula.titulo}
                    {aula.flashcards?.length > 0 && (
                      <span className="manual-aula-meta"> · {aula.flashcards.length} flashcards</span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      ))}

      <footer className="manual-rodape">{curso.titulo} · {cadeira.titulo} · SyntIA</footer>
    </div>
  );
}
