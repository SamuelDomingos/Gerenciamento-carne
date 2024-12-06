import React from 'react';
import { Bill, Installment } from '../types/billing';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X, Printer } from 'lucide-react';

interface PrintModalProps {
  bill: Bill;
  isOpen: boolean;
  onClose: () => void;
  onPrint: (billId: string, installmentNumber?: number) => void;
}

export function PrintModal({ bill, isOpen, onClose, onPrint }: PrintModalProps) {
  const [view, setView] = React.useState<'options' | 'installments'>('options');
  
  if (!isOpen) return null;

  const handlePrintAll = () => {
    onPrint(bill.id);
    onClose();
  };

  const handlePrintInstallment = (installmentNumber: number) => {
    onPrint(bill.id, installmentNumber);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {view === 'options' && 'Opções de Impressão'}
            {view === 'installments' && 'Selecionar Parcela para Impressão'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {view === 'options' && (
          <div className="space-y-4">
            <button
              onClick={handlePrintAll}
              className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg"
            >
              <div className="flex items-center">
                <Printer className="h-5 w-5 mr-2" />
                <div>
                  <h3 className="font-semibold">Imprimir carnê completo</h3>
                  <p className="text-sm text-gray-600">
                    Todas as {bill.totalInstallments} parcelas
                  </p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setView('installments')}
              className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg"
            >
              <div className="flex items-center">
                <Printer className="h-5 w-5 mr-2" />
                <div>
                  <h3 className="font-semibold">Imprimir parcela específica</h3>
                  <p className="text-sm text-gray-600">
                    Selecione uma parcela para impressão
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {view === 'installments' && (
          <div>
            <button
              onClick={() => setView('options')}
              className="mb-4 text-indigo-600 hover:text-indigo-800"
            >
              ← Voltar
            </button>
            
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {bill.installments.map((installment) => (
                <button
                  key={installment.number}
                  onClick={() => handlePrintInstallment(installment.number)}
                  className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">
                        Parcela {installment.number} de {bill.totalInstallments}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Vencimento: {format(installment.dueDate, 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">R$ {installment.value.toFixed(2)}</p>
                      <span className={`text-sm ${
                        installment.status === 'Pago' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {installment.status}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}