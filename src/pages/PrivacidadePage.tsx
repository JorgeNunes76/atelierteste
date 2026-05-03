import { GOLD, CREAM, CHARCOAL, SLATE } from "../lib/tokens";

export function PrivacidadePage() {
  return (
    <div style={{ background: CREAM, padding: "80px 24px 100px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        <p style={{ fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, fontWeight: 600, marginBottom: 16 }}>
          Informação Legal
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: 400, color: CHARCOAL,
          margin: "0 0 12px", lineHeight: 1.15,
        }}>
          Política de Privacidade
        </h1>
        <p style={{ fontSize: "0.82rem", color: SLATE, marginBottom: 48 }}>
          Última atualização: Março 2026
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          {[
            {
              title: "1. Responsável pelo Tratamento",
              body: "Ana Alexandre, artista plástica, é a responsável pelo tratamento dos dados pessoais recolhidos através deste website. Contacto: geral@ana-alexandre.pt"
            },
            {
              title: "2. Dados Recolhidos",
              body: "Recolhemos os dados que nos forneces voluntariamente através dos formulários de contacto e newsletter: nome, endereço de email e mensagem. Não recolhemos dados de pagamento — estes são processados por plataformas seguras de terceiros."
            },
            {
              title: "3. Finalidade do Tratamento",
              body: "Os dados são utilizados exclusivamente para: responder a pedidos de informação e contacto; envio da newsletter (com o teu consentimento); gestão de encomendas e comunicações relacionadas."
            },
            {
              title: "4. Base Legal",
              body: "O tratamento baseia-se no teu consentimento expresso (formulários e newsletter) e na execução de um contrato (encomendas), nos termos do artigo 6.º do RGPD."
            },
            {
              title: "5. Conservação dos Dados",
              body: "Os dados são conservados pelo período estritamente necessário às finalidades para as quais foram recolhidos, ou conforme exigido por obrigações legais."
            },
            {
              title: "6. Partilha com Terceiros",
              body: "Não vendemos nem partilhamos os teus dados com terceiros para fins comerciais. Podemos utilizar prestadores de serviços técnicos (alojamento, email) que atuam como subcontratantes e garantem conformidade com o RGPD."
            },
            {
              title: "7. Os Teus Direitos",
              body: "Tens direito a aceder, retificar, apagar ou portar os teus dados, bem como a opor-te ao seu tratamento. Para exercer estes direitos, contacta-nos em geral@ana-alexandre.pt. Tens ainda o direito de apresentar reclamação à CNPD (cnpd.pt)."
            },
            {
              title: "8. Cookies",
              body: "Utilizamos cookies essenciais para o funcionamento do website. Poderemos utilizar cookies analíticos para compreender como o website é utilizado. Podes gerir as tuas preferências através das definições do browser."
            },
          ].map(({ title, body }) => (
            <div key={title}>
              <h2 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "1.15rem", fontWeight: 500, color: CHARCOAL,
                margin: "0 0 10px",
              }}>{title}</h2>
              <p style={{ fontSize: "0.9rem", color: SLATE, lineHeight: 1.75 }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
