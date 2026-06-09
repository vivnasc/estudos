"use client";
import { useMemo, useState } from "react";
import Markdown from "../Markdown";

const ORDEM = ["Infonte", "FreeMe", "SyncHim", "Livros", "Oportunidade", "Outro"];

export default function BancoProduto({ banco }) {
  const [ativo, setAtivo] = useState("todos");

  // Produtos presentes, pela ordem definida, com contagem.
  const produtos = useMemo(() => {
    const c = {};
    for (const it of banco) c[it.produto] = (c[it.produto] || 0) + 1;
    return ORDEM.filter((p) => c[p]).map((p) => ({ nome: p, n: c[p] }));
  }, [banco]);

  const itens = useMemo(
    () => (ativo === "todos" ? banco : banco.filter((it) => it.produto === ativo)),
    [ativo, banco]
  );

  return (
    <>
      <div className="filtros">
        <span className="chip" data-prod="todos" data-on={ativo === "todos"} onClick={() => setAtivo("todos")}>
          todos · {banco.length}
        </span>
        {produtos.map((p) => (
          <span
            key={p.nome}
            className="chip"
            data-prod={p.nome}
            data-on={ativo === p.nome}
            onClick={() => setAtivo(p.nome)}
          >
            {p.nome} · {p.n}
          </span>
        ))}
      </div>

      {itens.length === 0 ? (
        <div className="empty">
          Ainda sem ideias{ativo !== "todos" ? ` para ${ativo}` : ""}. Aparecem aqui assim que
          processares aulas que liguem a este produto.
        </div>
      ) : (
        <div className="prod">
          {itens.map((it, i) => (
            <div className="prod-item" key={i} data-prod={it.produto}>
              <div className="prod-top">
                <span className="prod-badge" data-prod={it.produto}>{it.produto}</span>
                {it.temas.map((t) => (
                  <span className="tag" data-tema={t} key={t}>{t}</span>
                ))}
              </div>
              <div className="prod-ideia">{it.ideia}</div>
              <details className="prod-det">
                <summary>ver o rascunho completo</summary>
                <Markdown>{it.texto}</Markdown>
              </details>
              <div className="src">{it.areaTitulo} · {it.aula}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
