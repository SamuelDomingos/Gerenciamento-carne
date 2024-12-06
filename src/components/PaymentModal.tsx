import React from "react";
import { Bill } from '../types/billing';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface PaymentModalProps {
  bill: Bill;
  isOpen: boolean;
  onClose: () => void;
  onPayment: (billId: string, installmentNumber?: number) => void;
}

export function PaymentModal({
  bill,
  isOpen,
  onClose,
  onPayment,
}: PaymentModalProps) {
  const [view, setView] = React.useState<
    "options" | "installments" | "details"
  >("options");

  if (!isOpen) return null;

  // Verificações mais robustas
  if (!bill || !Array.isArray(bill.installments)) {
    console.error("Invalid bill data:", bill);
    toast.error("Dados do carnê inválidos");
    onClose();
    return null;
  }

  const pendingInstallments = bill.installments.filter(
    (i) => i.status === "Pendente"
  );
  const totalAmount = bill.installments.reduce(
    (sum, inst) => sum + inst.value,
    0
  );
  const remainingAmount = pendingInstallments.reduce(
    (sum, inst) => sum + inst.value,
    0
  );

  // Calcular a data de vencimento mais próxima
  const nextDueDate =
    pendingInstallments.length > 0
      ? pendingInstallments.reduce((earliest, current) =>
          current.dueDate < earliest.dueDate ? current : earliest
        ).dueDate
      : null;

  const handlePayAll = () => {
    if (bill.id) {
      onPayment(bill.id);
      onClose();
    }
  };

  const handlePayInstallment = (installmentNumber: number) => {
    if (bill && bill.id && typeof installmentNumber === 'number') {
      onPayment(bill.id, installmentNumber);
      onClose();
    } else {
      console.error('Invalid bill or installment data');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {view === "options" && "Opções de Pagamento"}
            {view === "installments" && "Selecionar Parcela"}
            {view === "details" && "Detalhes do Carnê"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {view === "options" && (
          <div className="space-y-4">
            <button
              onClick={handlePayAll}
              className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg"
            >
              <h3 className="font-semibold">
                Pagar todas as parcelas restantes
              </h3>
              <p className="text-sm text-gray-600">
                Total a pagar: R$ {remainingAmount.toFixed(2)}
              </p>
            </button>

            <button
              onClick={() => setView("installments")}
              className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg"
            >
              <h3 className="font-semibold">Pagar parcela específica</h3>
              <p className="text-sm text-gray-600">
                {pendingInstallments.length} parcelas em aberto
              </p>
            </button>

            <button
              onClick={() => setView("details")}
              className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg"
            >
              <h3 className="font-semibold">Ver detalhes completos</h3>
              <p className="text-sm text-gray-600">
                Histórico completo da compra
              </p>
            </button>
          </div>
        )}

        {view === "installments" && (
          <div>
            <button
              onClick={() => setView("options")}
              className="mb-4 text-indigo-600 hover:text-indigo-800"
            >
              ← Voltar
            </button>

            <div className="space-y-2">
              {pendingInstallments.map((installment) => (
                <button
                  key={installment.number}
                  onClick={() => handlePayInstallment(installment.number)}
                  className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">
                        Parcela {installment.number} de {bill.totalInstallments}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Vencimento:{" "}
                        {format(new Date(installment.dueDate), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        R$ {installment.value.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {view === "details" && (
          <div>
            <button
              onClick={() => setView("options")}
              className="mb-4 text-indigo-600 hover:text-indigo-800"
            >
              ← Voltar
            </button>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="font-semibold">R$ {totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor Restante</p>
                  <p className="font-semibold">
                    R$ {remainingAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {nextDueDate && (
              <div className="mb-4">
                <p className="font-semibold text-lg">
                  Próximo vencimento:{" "}
                  {format(new Date(nextDueDate), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            )}

            <div className="space-y-2">
              {bill.installments.map((installment) => (
                <div
                  key={installment.number}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">
                        Parcela {installment.number} de {bill.totalInstallments}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Vencimento:{" "}
                        {format(new Date(installment.dueDate), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                      {installment.paymentDate && (
                        <p className="text-sm text-gray-600">
                          Pago em:{" "}
                          {format(
                            new Date(installment.paymentDate),
                            "dd/MM/yyyy",
                            { locale: ptBR }
                          )}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        R$ {installment.value.toFixed(2)}
                      </p>
                      <span
                        className={`text-sm ${
                          installment.status === "Pago"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {installment.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
