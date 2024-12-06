export interface Installment {
  number: number;
  dueDate: Date;
  value: number;
  status: 'Pendente' | 'Pago';
  paymentDate?: Date;
}

export interface Bill {
  id: string;
  number: string;
  issueDate: Date;
  store: Store;
  customer: string;
  totalInstallments: number;
  installmentValue: number;
  dueDay: number;
  status: Status;
  observation?: string;
  installments: Installment[];
}

export type Status = 'Pendente' | 'Pago';

export type Store = 'Loja 2' | 'Loja 3' | 'Loja 4';