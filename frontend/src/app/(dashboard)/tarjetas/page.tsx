'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { CreditCard, Plus, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface TarjetaDto {
  alias: string;
  bank: string;
  lastFour?: string;
  creditLimit: number;
  cutDay: number;
  paymentDaysAfterCut: number;
  color: string;
}

interface Tarjeta extends TarjetaDto {
  _id: string;
  isActive: boolean;
}

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6'];

const EMPTY: TarjetaDto = {
  alias: '',
  bank: '',
  lastFour: '',
  creditLimit: 0,
  cutDay: 1,
  paymentDaysAfterCut: 20,
  color: '#6366f1',
};

export default function TarjetasPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<TarjetaDto>(EMPTY);
  const [formError, setFormError] = useState('');

  const { data: tarjetas = [], isLoading } = useQuery<Tarjeta[]>({
    queryKey: ['tarjetas'],
    queryFn: () => api.get('/credit-cards').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (dto: TarjetaDto) => api.post('/credit-cards', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tarjetas'] });
      setShowModal(false);
      setForm(EMPTY);
      setFormError('');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg ?? 'Error al crear la tarjeta');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    createMutation.mutate({
      ...form,
      creditLimit: Number(form.creditLimit),
      cutDay: Number(form.cutDay),
      paymentDaysAfterCut: Number(form.paymentDaysAfterCut),
      lastFour: form.lastFour || undefined,
    });
  };

  const field = (key: keyof TarjetaDto) => ({
    value: String(form[key] ?? ''),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div className="flex flex-col pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Mis Tarjetas</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva
        </button>
      </header>

      {/* Lista */}
      <div className="p-4 space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        )}

        {!isLoading && tarjetas.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aún no tienes tarjetas registradas</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-indigo-600 text-sm font-medium hover:underline"
            >
              Agregar primera tarjeta
            </button>
          </div>
        )}

        {tarjetas.map((t) => (
          <Link
            key={t._id}
            href={`/tarjetas/${t._id}`}
            className="block bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
          >
            {/* Franja de color */}
            <div className="h-1.5 w-full" style={{ backgroundColor: t.color }} />
            <div className="px-4 py-4 flex items-center gap-4">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${t.color}22` }}
              >
                <CreditCard className="h-5 w-5" style={{ color: t.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{t.alias}</p>
                <p className="text-xs text-gray-500">
                  {t.bank}{t.lastFour ? ` •••• ${t.lastFour}` : ''}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-400">Límite</p>
                <p className="text-sm font-semibold">{formatCurrency(t.creditLimit)}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
            </div>
            <div className="px-4 pb-3 flex gap-4 text-xs text-gray-400 border-t border-gray-50 dark:border-gray-800 pt-2">
              <span>Corte día <strong className="text-gray-600 dark:text-gray-300">{t.cutDay}</strong></span>
              <span>Pago <strong className="text-gray-600 dark:text-gray-300">{t.paymentDaysAfterCut}d</strong> después</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Modal nueva tarjeta */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold">Nueva tarjeta</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
              {formError && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm px-3 py-2 rounded-lg">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Alias *</label>
                  <input
                    {...field('alias')}
                    required
                    placeholder="ej. AMEX Oro"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Banco *</label>
                  <input {...field('bank')} required placeholder="ej. Santander" className="input-base" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Últimos 4 dígitos</label>
                  <input {...field('lastFour')} maxLength={4} placeholder="0000" className="input-base" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Límite de crédito *</label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    {...field('creditLimit')}
                    required
                    placeholder="50000"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Día de corte *</label>
                  <input type="number" min={1} max={31} {...field('cutDay')} required className="input-base" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Días para pagar *</label>
                  <input type="number" min={1} max={60} {...field('paymentDaysAfterCut')} required className="input-base" />
                </div>
              </div>

              {/* Selector de color */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, color: c }))}
                      className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c,
                        borderColor: form.color === c ? '#1e293b' : 'transparent',
                      }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {createMutation.isPending ? 'Guardando...' : 'Guardar tarjeta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
