"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const norm = (p) => (p || "/").replace(/\/+$/, "") || "/";

export default function Sidebar({ cursos, partilhada }) {
  const here = norm(usePathname());
  const [open, setOpen] = useState(false);
  const fechar = () => setOpen(false);

  const cursoActive = (id) => here === `/curso/${id}` || here.startsWith(`/curso/${id}/`);
  const cadActive = (cid, kid) => here.startsWith(`/curso/${cid}/${kid}`);
  const is = (href) => here === href || here.startsWith(href + "/");

  return (
    <>
      <div className="mobile-bar">
        <button className="burger" aria-label="Abrir menu" onClick={() => setOpen(true)}>☰</button>
        <Link href="/" className="mb-brand" onClick={fechar}><span className="star">✦</span> SyntIA</Link>
      </div>

      <div className={`scrim${open ? " show" : ""}`} onClick={fechar} />

      <aside className={`sidebar${open ? " open" : ""}`} onClick={fechar}>
        <Link href="/" className="sb-brand"><span className="star">✦</span> SyntIA</Link>

        <div className="sb-group-label">Cursos</div>
        {cursos.map((c) => (
          <div key={c.id} className="sb-curso-block">
            <Link href={`/curso/${c.id}`} className={`sb-link sb-curso${cursoActive(c.id) ? " active" : ""}`}>
              {c.titulo}
            </Link>
            {c.cadeiras.map((k) => (
              <Link
                key={k.id}
                href={`/curso/${c.id}/${k.id}`}
                className={`sb-link sb-cad${cadActive(c.id, k.id) ? " active" : ""}`}
              >
                {k.titulo}
              </Link>
            ))}
          </div>
        ))}

        {partilhada && (
          <Link href="/partilhada" className={`sb-link sb-curso${is("/partilhada") ? " active" : ""}`}>
            {partilhada.titulo} <span className="sb-tag">comum</span>
          </Link>
        )}

        <div className="sb-group-label">Ferramentas</div>
        <Link href="/produto" className={`sb-link${is("/produto") ? " active" : ""}`}>Banco de Produto</Link>
        <Link href="/enviar" className={`sb-link${is("/enviar") ? " active" : ""}`}>Enviar aula</Link>
      </aside>
    </>
  );
}
