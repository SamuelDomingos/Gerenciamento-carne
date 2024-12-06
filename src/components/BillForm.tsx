
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const stores = ['Loja 2', 'Loja 3', 'Loja 4'] as const;

const billSchema = z.object({
  number: z.string().min(1, 'Número do talão é obrigatório'),
  issueDate: z.string().min(1, 'Data de emissão é obrigatória'),
  store: z.enum(stores, {
    errorMap: () => ({ message: 'Selecione uma loja' }),
  }),
  customer: z.string().min(1, 'Nome do cliente é obrigatório'),
  totalInstallments: z.number().min(1, 'Número de parcelas deve ser maior que 0'),
  installmentValue: z.number().min(0.01, 'Valor da parcela deve ser maior que 0'),
  dueDay: z.number().min(1).max(31, 'Dia de vencimento deve estar entre 1 e 31'),
  observation: z.string().optional(),
});

type BillFormData = z.infer<typeof billSchema>;

interface BillFormProps {
  onSubmit: (data: BillFormData) => void;
}

export function BillForm({ onSubmit }: BillFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-6">Cadastro de Carnê</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Número do Talão
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                {...register('number')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.number && (
                <p className="mt-1 text-sm text-red-600">{errors.number.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data de Emissão
            </label>
            <div className="mt-1 relative">
              <input
                type="date"
                {...register('issueDate')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.issueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.issueDate.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Loja
            </label>
            <select
              {...register('store')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Selecione uma loja</option>
              {stores.map((store) => (
                <option key={store} value={store}>{store}</option>
              ))}
            </select>
            {errors.store && (
              <p className="mt-1 text-sm text-red-600">{errors.store.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cliente
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                {...register('customer')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.customer && (
                <p className="mt-1 text-sm text-red-600">{errors.customer.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Número de Parcelas
            </label>
            <div className="mt-1 relative">
              <input
                type="number"
                min="1"
                {...register('totalInstallments', { valueAsNumber: true })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.totalInstallments && (
                <p className="mt-1 text-sm text-red-600">{errors.totalInstallments.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Valor da Parcela
            </label>
            <div className="mt-1 relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                {...register('installmentValue', { valueAsNumber: true })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.installmentValue && (
                <p className="mt-1 text-sm text-red-600">{errors.installmentValue.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dia do Vencimento
            </label>
            <div className="mt-1 relative">
              <input
                type="number"
                min="1"
                max="31"
                {...register('dueDay', { valueAsNumber: true })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.dueDay && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDay.message}</p>
              )}
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Observação
            </label>
            <div className="mt-1">
              <textarea
                {...register('observation')}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cadastrar Carnê
          </button>
        </div>
      </div>
    </form>
  );
}