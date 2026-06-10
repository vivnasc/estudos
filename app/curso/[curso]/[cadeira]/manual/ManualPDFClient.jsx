"use client";

import dynamic from "next/dynamic";

// O @react-pdf/renderer (PDFViewer/PDFDownloadLink) é estritamente do browser.
// Carregamo-lo só no cliente para não rebentar o prerender estático da página.
const ManualPDF = dynamic(() => import("./ManualPDF"), {
  ssr: false,
  loading: () => <p className="empty">A renderizar o PDF…</p>,
});

export default function ManualPDFClient(props) {
  return <ManualPDF {...props} />;
}
