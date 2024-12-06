import { Bill, Installment } from "../types/billing";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import logo from "../assets/logo.ico";

const lojas = [
  {
    nome: "Loja 2",
    endereco: "Rua Pedro Pereira 307 - Centro",
    telefone: "85 32-311844",
  },
  {
    nome: "Loja 3",
    endereco: "Rua Guilherme Rocha 218 - Centro",
    telefone: "85 3253-3983",
  },
  {
    nome: "Loja 4",
    endereco: "Rua Guilherme Rocha 180 - Centro",
    telefone: "85 3213-9880",
  },
];

export class PrintService {
  static generateBillHTML(bill: Bill, installmentNumber?: number) {
    const style = `
      <style>
        @media print {
          body { 
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            font-size: 12px;
          }
          .page {
            display: flex;
            page-break-after: always;
          }
          .section {
            width: 50%;
            padding: 15px;
            box-sizing: border-box;
          }
          .section:first-child {
            border-right: 1px dashed #000;
          }
          .logo {
            max-height: 50px;
          }
          .bill-header {
            text-align: center;
            margin-bottom: 10px;
          }
          .bill-info {
            margin-bottom: 10px;
            font-size: 11px;
          }
          .installment {
            border: 1px solid #000;
            padding: 8px;
            margin-bottom: 10px;
          }
          .installment-header {
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
            margin-bottom: 5px;
            font-size: 11px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 5px;
            font-size: 10px;
          }
          .full-width {
            grid-column: 1 / -1;
          }
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      </style>
    `;

    const generateSection = (installment: Installment, isStore: boolean) => `
  <div class="section">
    <img src="${logo}" alt="Logo" class="logo">
    <div class="bill-header">
      <h3>${isStore ? "Via Loja" : "Via Cliente"}</h3>
      <p>Carnê Nº ${bill.number}</p>
    </div>
    
    <div class="bill-info">
      <div class="grid">
        <div><strong>Cliente:</strong> ${bill.customer}</div>
        <div><strong>Loja:</strong> ${bill.store}</div>
        <div><strong>Data:</strong> ${format(
          new Date(bill.issueDate),
          "dd/MM/yyyy",
          { locale: ptBR }
        )}</div>
        <div><strong>Total:</strong> R$ ${(
          bill.installmentValue * bill.totalInstallments
        ).toFixed(2)}</div>
      </div>
    </div>

    <div class="installment">
      <div class="installment-header">
        <strong>Parcela ${installment.number}/${bill.totalInstallments}</strong>
      </div>
      <div class="grid">
        <div><strong>Valor:</strong> R$ ${installment.value.toFixed(2)}</div>
        <div><strong>Vencimento:</strong> ${format(
          installment.dueDate,
          "dd/MM/yyyy",
          { locale: ptBR }
        )}</div>
        <div class="full-width">
        ${
          installment.status === "Pago" && installment.paymentDate
            ? `<strong>Status:</strong> ${
                installment.status
              } (Pago em: ${format(installment.paymentDate, "dd/MM/yyyy", {
                locale: ptBR,
              })})`
            : ""
        }
        
        </div>
      </div>
    </div>

    <div class="store-info">
      <h4>Endereços para pagamento:</h4>
      <ul>
        ${lojas
          .map(
            (loja) =>
              `<li><strong>${loja.nome}:</strong> ${loja.endereco}, Tel: ${loja.telefone}</li>`
          )
          .join("")}
      </ul>
    </div>
  </div>
`;

    const installmentsToShow = installmentNumber
      ? bill.installments.filter((i) => i.number === installmentNumber)
      : bill.installments;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Carnê - ${bill.customer}</title>
          ${style}
        </head>
        <body>
          ${installmentsToShow
            .map(
              (installment) => `
            <div class="page">
              ${generateSection(installment, true)}
              ${generateSection(installment, false)}
            </div>
          `
            )
            .join("")}
        </body>
      </html>
    `;

    return html;
  }

  static print(bill: Bill, installmentNumber?: number) {
    const html = this.generateBillHTML(bill, installmentNumber);

    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";

    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(html);
      frameDoc.close();

      printFrame.onload = () => {
        printFrame.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      };
    }
  }
}
