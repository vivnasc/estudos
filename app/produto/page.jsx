import Link from "next/link";
import BancoProduto from "./BancoProduto";
import { getBanco, getTemas } from "../../lib/conteudo";

export default function ProdutoPage() {
  const banco = getBanco();
  const temas = getTemas();

  return (
    <>
      <div className="crumbs">
        <Link href="/">Início</Link> / Banco de Produto
      </div>
      <h1>Banco de Produto</h1>
      <p className="lead">
        Só ideias <strong>úteis</strong>: como o que aprendes alimenta os teus
        produtos reais (Infonte, FreeMe, Coleções…). Cada cartão nomeia o produto
        e diz de que aula veio. Sem "a aula não falou disto" — se não há ligação,
        não aparece.
      </p>

      <BancoProduto banco={banco} temas={temas} />

      <div className="footer">corpo · amor · maternidade · prosperidade</div>
    </>
  );
}
