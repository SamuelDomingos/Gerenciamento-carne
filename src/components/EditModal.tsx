import React from 'react';
import { Bill, Installment } from '../types/billing';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X } from 'lucide-react';

interface EditModalProps {
  bill: Bill;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (billId: string, changes: Partial<Bill>, installmentNumber?: number) => void;
}

export function EditModal({ bill, isOpen, onClose, onEdit }: EditModalProps) {
  const [view, setView] = React.useState<'options' | 'installments' | 'fullEdit'>('options');
  const [editFormData, setEditFormData] = React.useState({
    customer: bill.customer,
    installmentValue: bill.installmentValue,
    observation: bill.observation || '',
  });
  const [selectedInstallment, setSelectedInstallment] = React.useState<number | null>(null);
  const [installmentValue, setInstallmentValue] = React.useState<number>(0);

  if (!isOpen) return null;

  const handleFullEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onEdit(bill.id, editFormData);
    onClose();
  };

  const handleInstallmentEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInstallment && installmentValue > 0) {
      onEdit(bill.id, { installmentValue }, selectedInstallment);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {view === 'options' && 'Opções de Edição'}
            {view === 'installments' && 'Editar Parcela Específica'}
            {view === 'fullEdit' && 'Editar Carnê Completo'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {view === 'options' && (
          <div className="space-y-4">
            <button
              onClick={() => setView('fullEdit')}
              className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg"
            >
              <h3 className="font-semibold">Editar carnê completo</h3>
              <p className="text-sm text-gray-600">
                Alterar informações gerais do carnê
              </p>
            </button>
            
            <button
              onClick={() => setView('installments')}
              className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg"
            >
              <h3 className="font-semibold">Editar parcela específica</h3>
              <p className="text-sm text-gray-600">
                Modificar valor de uma parcela individual
              </p>
            </button>
          </div>
        )}

        {view === 'fullEdit' && (
          <form onSubmit={handleFullEdit} className="space-y-4">
            <button
              type="button"
              onClick={() => setView('options')}
              className="mb-4 text-indigo-600 hover:text-indigo-800"
            >
              ← Voltar
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700">Cliente</label>
              <input
                type="text"
                value={editFormData.customer}
                onChange={(e) => setEditFormData(prev => ({ ...prev, customer: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Valor da Parcela</label>
              <input
                type="number"
                step="0.01"
                value={editFormData.installmentValue}
                onChange={(e) => setEditFormData(prev => ({ ...prev, installmentValue: parseFloat(e.target.value) }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Observação</label>
              <textarea
                value={editFormData.observation}
                onChange={(e) => setEditFormData(prev => ({ ...prev, observation: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Salvar Alterações
            </button>
          </form>
        )}

        {view === 'installments' && (
          <div>
            <button
              onClick={() => setView('options')}
              className="mb-4 text-indigo-600 hover:text-indigo-800"
            >
              ← Voltar
            </button>

            <form onSubmit={handleInstallmentEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecione a parcela para editar
                </label>
                <div className="space-y-2">
                  {bill.installments.map((installment) => (
                    <button
                      key={installment.number}
                      type="button"
                      onClick={() => {
                        setSelectedInstallment(installment.number);
                        setInstallmentValue(installment.value);
                      }}
                      className={`w-full p-4 text-left rounded-lg border ${
                        selectedInstallment === installment.number
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
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
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedInstallment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Novo valor da parcela
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={installmentValue}
                    onChange={(e) => setInstallmentValue(parseFloat(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedInstallment}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Salvar Alterações
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}