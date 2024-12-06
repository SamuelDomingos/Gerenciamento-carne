// services/print.ts
import { Bill, Installment } from '../types/billing';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export class PrintService {
  static generateBillHTML(bill: Bill, installmentNumber?: number) {
    const style = `
      <style>
        @media print {
          body { font-family: Arial, sans-serif; }
          .bill-header { text-align: center; margin-bottom: 20px; }
          .bill-info { margin-bottom: 20px; }
          .installment { 
            border: 1px solid #000; 
            padding: 10px; 
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .installment-header { 
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
            margin-bottom: 10px;
          }
          .grid { 
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .full-width {
            grid-column: 1 / -1;
          }
          @page {
            margin: 2cm;
            size: A4;
          }
        }
      </style>
    `;

    const generateInstallmentHTML = (installment: Installment) => `
      <div class="installment">
        <div class="installment-header">
          <h3>Parcela ${installment.number} de ${bill.totalInstallments}</h3>
        </div>
        <div class="grid">
          <div>
            <strong>Cliente:</strong> ${bill.customer}
          </div>
          <div>
            <strong>Loja:</strong> ${bill.store}
          </div>
          <div>
            <strong>Valor:</strong> R$ ${installment.value.toFixed(2)}
          </div>
          <div>
            <strong>Vencimento:</strong> ${format(installment.dueDate, 'dd/MM/yyyy', { locale: ptBR })}
          </div>
          <div class="full-width">
            <strong>Status:</strong> ${installment.status}
            ${installment.paymentDate ? 
              ` (Pago em: ${format(installment.paymentDate, 'dd/MM/yyyy', { locale: ptBR })})` 
              : ''}
          </div>
        </div>
      </div>
    `;

    const installmentsToShow = installmentNumber 
      ? bill.installments.filter(i => i.number === installmentNumber)
      : bill.installments;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Carnê - ${bill.customer}</title>
          ${style}
        </head>
        <body>
          <div class="bill-header">
            <h2>Carnê de Pagamento</h2>
            <p>Nº ${bill.number}</p>
          </div>
          
          <div class="bill-info">
            <div class="grid">
              <div><strong>Cliente:</strong> ${bill.customer}</div>
              <div><strong>Loja:</strong> ${bill.store}</div>
              <div><strong>Data de Emissão:</strong> ${format(new Date(bill.issueDate), 'dd/MM/yyyy', { locale: ptBR })}</div>
              <div><strong>Valor Total:</strong> R$ ${(bill.installmentValue * bill.totalInstallments).toFixed(2)}</div>
            </div>
          </div>

          ${installmentsToShow.map(generateInstallmentHTML).join('')}
        </body>
      </html>
    `;

    return html;
  }

  static print(bill: Bill, installmentNumber?: number) {
    const html = this.generateBillHTML(bill, installmentNumber);
    
    // Cria um iframe oculto para impressão
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    
    document.body.appendChild(printFrame);
    
    const frameDoc = printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(html);
      frameDoc.close();
      
      // Espera o conteúdo carregar antes de imprimir
      printFrame.onload = () => {
        printFrame.contentWindow?.print();
        
        // Remove o iframe após um tempo
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      };
    }
  }
}