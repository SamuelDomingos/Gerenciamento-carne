import { Bill } from '../types/billing';

const STORAGE_KEY = 'billing_management_bills';

const StorageService = {
  getBills(): Bill[] {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (!storedData) return [];

      const bills = JSON.parse(storedData);
      return bills.map((bill: Bill) => ({
        ...bill,
        issueDate: new Date(bill.issueDate),
        installments: Array.isArray(bill.installments)
          ? bill.installments.map(inst => ({
              ...inst,
              dueDate: new Date(inst.dueDate),
              paymentDate: inst.paymentDate ? new Date(inst.paymentDate) : undefined
            }))
          : []
      }));
    } catch (error) {
      console.error('Error loading bills:', error);
      return [];
    }
  },

  saveBills(bills: Bill[]): void {
    try {
      const processedBills = bills.map(bill => ({
        ...bill,
        installments: bill.installments.map(inst => ({
          ...inst,
          dueDate: new Date(inst.dueDate),
          paymentDate: inst.paymentDate ? new Date(inst.paymentDate) : undefined
        }))
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(processedBills));
    } catch (error) {
      console.error('Error saving bills:', error);
      throw error;
    }
  },

  updateBill(updatedBill: Bill): void {
    const bills = StorageService.getBills();
    const index = bills.findIndex(bill => bill.id === updatedBill.id);
    if (index !== -1) {
      bills[index] = updatedBill;
      StorageService.saveBills(bills);
    }
  },

  deleteBill(id: string): void {
    const bills = StorageService.getBills();
    const filteredBills = bills.filter(bill => bill.id !== id);
    StorageService.saveBills(filteredBills);
  },

  addBill(newBill: Bill): void {
    const bills = StorageService.getBills();
    bills.push(newBill);
    StorageService.saveBills(bills);
  }
};

export default StorageService;