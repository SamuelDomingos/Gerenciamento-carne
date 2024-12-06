import { useState } from "react";
import { format } from "date-fns";
import { Bill, Status, Store } from "../types/billing";
import { Printer, Edit2, Trash2, CheckCircle } from "lucide-react";
import { PaymentModal } from "./PaymentModal";
import { PrintModal } from "./PrintModal";

interface BillListProps {
  bills: Bill[];
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onPayment: (id: string, installmentNumber?: number) => void;
  onPrint: (id: string, installmentNumber?: number) => void;
}

export function BillList({
  bills,
  onEdit,
  onDelete,
  onPayment,
  onPrint,
}: BillListProps) {
  const [filters, setFilters] = useState({
    status: "" as Status | "",
    store: "" as Store | "",
    customer: "",
    startDate: "",
    endDate: "",
  });

  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const filteredBills = bills.filter((bill) => {
    if (filters.status && bill.status !== filters.status) return false;
    if (filters.store && bill.store !== filters.store) return false;
    if (
      filters.customer &&
      !bill.customer.toLowerCase().includes(filters.customer.toLowerCase())
    )
      return false;
    if (
      filters.startDate &&
      new Date(bill.issueDate) < new Date(filters.startDate)
    )
      return false;
    if (filters.endDate && new Date(bill.issueDate) > new Date(filters.endDate))
      return false;
    return true;
  });

  const handlePaymentClick = (bill: Bill) => {
    setSelectedBill(bill);
    setIsPaymentModalOpen(true);
  };

  const handlePrintClick = (bill: Bill) => {
    setSelectedBill(bill);
    setIsPrintModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setSelectedBill(null);
    setIsPaymentModalOpen(false);
  };

  const handleClosePrintModal = () => {
    setSelectedBill(null);
    setIsPrintModalOpen(false);
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Carnês</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value as Status,
              }))
            }
            className="border rounded-md p-2"
          >
            <option value="">Todos os Status</option>
            <option value="Pendente">Pendente</option>
            <option value="Pago">Pago</option>
          </select>

          <select
            value={filters.store}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                store: e.target.value as Store,
              }))
            }
            className="border rounded-md p-2"
          >
            <option value="">Todas as Lojas</option>
            <option value="Loja 2">Loja 2</option>
            <option value="Loja 3">Loja 3</option>
            <option value="Loja 4">Loja 4</option>
          </select>

          <input
            type="text"
            placeholder="Buscar cliente..."
            value={filters.customer}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, customer: e.target.value }))
            }
            className="border rounded-md p-2"
          />

          <div className="flex gap-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="border rounded-md p-2 w-1/2"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="border rounded-md p-2 w-1/2"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Talão
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loja
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parcelas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBills.map((bill) => (
              <tr key={bill.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {bill.number}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(bill.issueDate), "dd/MM/yyyy")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{bill.customer}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{bill.store}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {
                      bill.installments.filter((i) => i.status === "Pago")
                        .length
                    }{" "}
                    de {bill.totalInstallments} pagas
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    R$ {bill.installmentValue.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      bill.status === "Pago"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {bill.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(bill)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(bill.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handlePaymentClick(bill)}
                      className="text-green-600 hover:text-green-900"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handlePrintClick(bill)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Printer className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedBill && (
        <PaymentModal
          bill={selectedBill}
          isOpen={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          onPayment={onPayment}
        />
      )}

      {selectedBill && (
        <PrintModal
          bill={selectedBill}
          isOpen={isPrintModalOpen}
          onClose={handleClosePrintModal}
          onPrint={onPrint}
        />
      )}
    </div>
  );
}
