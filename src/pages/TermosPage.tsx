import { GOLD, CREAM, CHARCOAL, SLATE } from "../lib/tokens";

export function TermosPage() {
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
          Termos e Condições
        </h1>
        <p style={{ fontSize: "0.82rem", color: SLATE, marginBottom: 48 }}>
          Última atualização: Março 2026
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          {[
            {
              title: "1. Identificação",
              body: "Este website é propriedade de Ana Alexandre, artista plástica. Para efeitos de contacto: geral@ana-alexandre.pt"
            },
            {
              title: "2. Objeto",
              body: "Os presentes Termos regulam o acesso e utilização do website ana-alexandre.pt, incluindo a consulta de obras, pedidos de informação e aquisição de obras de arte originais."
            },
            {
              title: "3. Propriedade Intelectual",
              body: "Todas as imagens, textos e conteúdos presentes neste website são propriedade exclusiva de Ana Alexandre e estão protegidos pela legislação de direitos de autor em vigor. É proibida qualquer reprodução total ou parcial sem autorização expressa."
            },
            {
              title: "4. Aquisição de Obras",
              body: "As obras apresentadas no website são peças originais e únicas. Os preços indicados são em Euros (€) e incluem IVA quando aplicável. A conclusão de uma compra fica sujeita à confirmação de disponibilidade da obra e à receção do pagamento integral."
            },
            {
              title: "5. Envio e Entrega",
              body: "O envio das obras é efetuado com embalagem especializada para arte. Os prazos e custos de envio são acordados individualmente conforme a dimensão e destino da obra."
            },
            {
              title: "6. Devoluções",
              body: "Dado o caráter único de cada obra, não são aceites devoluções salvo em caso de dano durante o transporte, devidamente documentado e comunicado no prazo de 48h após a receção."
            },
            {
              title: "7. Proteção de Dados",
              body: "O tratamento dos dados pessoais é efetuado em conformidade com o RGPD e a legislação nacional aplicável. Consulta a nossa Política de Privacidade para mais informações."
            },
            {
              title: "8. Lei Aplicável",
              body: "Os presentes Termos regem-se pela legislação portuguesa. Em caso de litígio, as partes acordam submeter-se aos tribunais portugueses competentes."
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
