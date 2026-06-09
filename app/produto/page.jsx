import Link from "next/link";
import BancoProduto from "./BancoProduto";
import { getBanco } from "../../lib/conteudo";

export default function ProdutoPage() {
  const banco = getBanco();

  return (
    <>
      <div className="crumbs">
        <Link href="/">Início</Link> / Banco de Produto
      </div>
      <h1>Banco de Produto</h1>
      <p className="lead">
        O que aprendes, pronto a <strong>implementar</strong>. Filtra pelo teu
        produto (Infonte, FreeMe, SyncHim, Livros), lê a ideia numa linha e abre
        o rascunho só se quiseres. Cada cartão diz de que aula veio.
      </p>

      <BancoProduto banco={banco} />
    </>
  );
}
