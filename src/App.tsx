import { useState, useEffect } from "react";
import { BillForm } from "./components/BillForm";
import { BillList } from "./components/BillList";
import { EditModal } from "./components/EditModal";
import { PaymentModal } from "./components/PaymentModal";
import { Bill, Installment } from "./types/billing";
import { toast, Toaster } from "react-hot-toast";
import StorageService from "./services/storage";
import { PrintService } from "./services/prints";

function App() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    try {
      const loadedBills = StorageService.getBills();
      if (Array.isArray(loadedBills)) {
        setBills(loadedBills);
      } else {
        console.error("Invalid bills data loaded");
        setBills([]);
      }
    } catch (error) {
      console.error("Error loading bills:", error);
      setBills([]);
      toast.error("Erro ao carregar os carnês");
    }
  }, []);

  const calculateDueDate = (
    issueDate: Date,
    monthsToAdd: number,
    dueDay: number
  ) => {
    const dueDate = new Date(issueDate);
    dueDate.setMonth(dueDate.getMonth() + monthsToAdd + 1);
    dueDate.setDate(dueDay);

    const lastDayOfMonth = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth() + 1,
      0
    ).getDate();
    if (dueDay > lastDayOfMonth) {
      dueDate.setDate(lastDayOfMonth);
    }

    return dueDate;
  };

  const handleSubmit = (data: {
    number: string;
    issueDate: string;
    store: "Loja 2" | "Loja 3" | "Loja 4";
    customer: string;
    totalInstallments: number;
    installmentValue: number;
    dueDay: number;
    observation?: string;
  }) => {
    const issueDate = new Date(data.issueDate);
    const dueDay = data.dueDay;

    const newBill: Bill = {
      id: Date.now().toString(),
      ...data,
      issueDate: new Date(data.issueDate),
      status: "Pendente",
      installments: Array.from(
        { length: data.totalInstallments },
        (_, index) => ({
          number: index + 1,
          dueDate: calculateDueDate(issueDate, index, dueDay),
          value: data.installmentValue,
          status: "Pendente",
        })
      ),
    };

    StorageService.addBill(newBill);
    setBills((prev) => [...prev, newBill]);
    toast.success("Carnê cadastrado com sucesso!");
  };

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (
    billId: string,
    changes: Partial<Bill>,
    installmentNumber?: number
  ) => {
    setBills((prev) => {
      const newBills = prev.map((bill) => {
        if (bill.id === billId) {
          if (installmentNumber) {
            // Edição de parcela específica
            const updatedInstallments = bill.installments.map((inst) =>
              inst.number === installmentNumber
                ? { ...inst, value: changes.installmentValue || inst.value }
                : inst
            ) as Installment[];
            const updatedBill: Bill = {
              ...bill,
              installments: updatedInstallments,
            };
            StorageService.updateBill(updatedBill);
            return updatedBill;
          } else {
            // Edição do carnê completo
            const updatedBill: Bill = {
              ...bill,
              ...changes,
              installments: changes.installmentValue
                ? (bill.installments.map((inst) => ({
                    ...inst,
                    value: changes.installmentValue,
                  })) as Installment[])
                : bill.installments,
            };
            StorageService.updateBill(updatedBill);
            return updatedBill;
          }
        }
        return bill;
      });
      return newBills;
    });
    toast.success("Carnê atualizado com sucesso!");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este carnê?")) {
      StorageService.deleteBill(id);
      setBills((prev) => prev.filter((bill) => bill.id !== id));
      toast.success("Carnê excluído com sucesso!");
    }
  };

  const handlePayment = (id: string, installmentNumber?: number) => {
    setBills((prev) => {
      const newBills = prev.map((bill) => {
        if (bill.id === id) {
          let updatedBill: Bill;
          if (installmentNumber) {
            const updatedInstallments = bill.installments.map((inst) =>
              inst.number === installmentNumber
                ? { ...inst, status: "Pago" as const, paymentDate: new Date() }
                : inst
            );
            const allPaid = updatedInstallments.every(
              (inst) => inst.status === "Pago"
            );
            updatedBill = {
              ...bill,
              installments: updatedInstallments,
              status: allPaid ? "Pago" : "Pendente",
            };
          } else {
            updatedBill = {
              ...bill,
              status: "Pago",
              installments: bill.installments.map((inst) => ({
                ...inst,
                status: "Pago" as const,
                paymentDate: new Date(),
              })),
            };
          }
          StorageService.updateBill(updatedBill);
          return updatedBill;
        }
        return bill;
      });
      return newBills;
    });
    toast.success("Pagamento registrado com sucesso!");
  };

  const handlePrint = (id: string, installmentNumber?: number) => {
    const bill = bills.find((b) => b.id === id);
    if (!bill) return;

    try {
      PrintService.print(bill, installmentNumber);
      toast.success("Documento enviado para impressão!");
    } catch (error) {
      console.error("Erro ao imprimir:", error);
      toast.error("Erro ao gerar documento para impressão");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Sistema de Gerenciamento de Carnês
          </h1>

          <div className="space-y-8">
            <BillForm onSubmit={handleSubmit} />
            <BillList
              bills={bills}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPayment={handlePayment}
              onPrint={handlePrint}
            />
          </div>
        </div>
      </div>

      {editingBill && (
        <EditModal
          bill={editingBill}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingBill(null);
          }}
          onEdit={handleEditSubmit}
        />
      )}

      {selectedBill && isPaymentModalOpen && (
        <PaymentModal
          bill={selectedBill}
          isOpen={true}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedBill(null);
          }}
          onPayment={handlePayment}
        />
      )}

      <Toaster position="top-right" />
    </div>
  );
}

export default App;
