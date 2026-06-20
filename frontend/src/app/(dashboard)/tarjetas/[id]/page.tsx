'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Plus, CreditCard, X, Calendar } from 'lucide-react';

interface Tarjeta {
  _id: string;
  alias: string;
  bank: string;
  lastFour?: string;
  creditLimit: number;
  cutDay: number;
  paymentDaysAfterCut: number;
  color: string;
}

interface PeriodSummary {
  period: {
    _id: string;
    cutDate: string;
    paymentDate: string;
    previousBalance: number;
    scheduledFirstQuinc: number;
    scheduledSecondQuinc: number;
  };
  totalExpenses: number;
  totalPayments: number;
  newBalance: number;
  noInterestPayment: number;
  daysUntilPayment: number;
  budgetUsedPct: number;
}

interface MovDto {
  date: string;
  description: string;
  amount: number;
  category: string;
  isMsi: boolean;
}

const EMPTY_MOV: MovDto = { date: '', description: '', amount: 0, category: 'Varios', isMsi: false };
const CATEGORIES = ['Varios', 'Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Ropa', 'Hogar', 'Servicios', 'Viajes', 'Educación'];

export default function TarjetaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [showMovModal, setShowMovModal] = useState(false);
  const [movForm, setMovForm] = useState<MovDto>(EMPTY_MOV);
  const [movError, setMovError] = useState('');

  const { data: tarjeta, isLoading: loadingCard } = useQuery<Tarjeta>({
    queryKey: ['tarjeta', id],
    queryFn: () => api.get(`/credit-cards/${id}`).then((r) => r.data),
  });

  const periodKey = ['cc-period', id, year, month];

  const { data: periodSummary, isLoading: loadingPeriod } = useQuery<PeriodSummary>({
    queryKey: periodKey,
    queryFn: async () => {
      const { data: period } = await api.post(`/credit-cards/${id}/periods`, { year, month });
      const { data: summary } = await api.get(`/credit-cards/periods/${period._id}/summary`);
      return summary;
    },
    enabled: !!tarjeta,
  });

  const addMovMutation = useMutation({
    mutationFn: async (dto: MovDto) => {
      const { data: period } = await api.post(`/credit-cards/${id}/periods`, { year, month });
      return api.post(`/credit-cards/periods/${period._id}/movements`, dto);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: periodKey });
      setShowMovModal(false);
      setMovForm(EMPTY_MOV);
      setMovError('');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setMovError(msg ?? 'Error al agregar movimiento');
    },
  });

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const monthLabel = new Date(year, month - 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

  if (loadingCard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!tarjeta) {
    return <div className="p-4 text-gray-500">Tarjeta no encontrada</div>;
  }

  const ps = periodSummary;
  const balanceColor = !ps ? '' : ps.newBalance <= 0 ? 'text-green-600' : ps.daysUntilPayment <= 5 ? 'text-red-600' : 'text-gray-900 dark:text-gray-100';

  return (
    <div className="flex flex-col pb-20 md:pb-0">
      {/* Header */}
      <header
        className="px-4 py-4 flex items-center gap-3"
        style={{ background: `linear-gradient(135deg, ${tarjeta.color}22, ${tarjeta.color}11)` }}
      >
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${tarjeta.color}33` }}
        >
          <CreditCard className="h-5 w-5" style={{ color: tarjeta.color }} />
        </div>
        <div>
          <h2 className="font-bold text-base">{tarjeta.alias}</h2>
          <p className="text-xs text-gray-500">{tarjeta.bank}{tarjeta.lastFour ? ` •••• ${tarjeta.lastFour}` : ''}</p>
        </div>
      </header>

      {/* Navegador de período */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <button onClick={prevMonth} className="text-gray-400 hover:text-gray-600 p-1">&#x276E;</button>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium capitalize">{monthLabel}</span>
        </div>
        <button onClick={nextMonth} className="text-gray-400 hover:text-gray-600 p-1">&#x276F;</button>
      </div>

      {/* Resumen del período */}
      <div className="p-4 space-y-3">
        {loadingPeriod ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        ) : ps ? (
          <>
            {/* Tarjeta de saldo */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Saldo del período</p>
                <p className={`text-2xl font-bold ${balanceColor}`}>{formatCurrency(ps.newBalance)}</p>
              </div>
              <div className="h-px bg-gray-100 dark:bg-gray-800" />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Gastos del corte</p>
                  <p className="font-semibold text-red-600">{formatCurrency(ps.totalExpenses)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Pagos registrados</p>
                  <p className="font-semibold text-green-600">{formatCurrency(ps.totalPayments)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Pago sin intereses</p>
                  <p className="font-semibold">{formatCurrency(ps.noInterestPayment)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Días para pagar</p>
                  <p className={`font-semibold ${ps.daysUntilPayment <= 5 ? 'text-red-600' : ps.daysUntilPayment <= 10 ? 'text-yellow-600' : ''}`}>
                    {ps.daysUntilPayment > 0 ? `${ps.daysUntilPayment} días` : 'Vencido'}
                  </p>
                </div>
              </div>
              {ps.budgetUsedPct > 0 && (
                <>
                  <div className="h-px bg-gray-100 dark:bg-gray-800" />
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Uso del presupuesto</span>
                      <span>{ps.budgetUsedPct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${ps.budgetUsedPct >= 100 ? 'bg-red-500' : ps.budgetUsedPct >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(ps.budgetUsedPct, 100)}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Fechas */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Fecha de corte</p>
                  <p className="font-medium">{new Date(ps.period.cutDate).toLocaleDateString('es-MX')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Fecha límite de pago</p>
                  <p className="font-medium">{new Date(ps.period.paymentDate).toLocaleDateString('es-MX')}</p>
                </div>
              </div>
            </div>

            {/* Pagos programados por quincena */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4">
              <p className="text-xs font-medium text-gray-500 mb-3">Pagos programados</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">1a quincena</p>
                  <p className="font-semibold">{formatCurrency(ps.period.scheduledFirstQuinc)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">2a quincena</p>
                  <p className="font-semibold">{formatCurrency(ps.period.scheduledSecondQuinc)}</p>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {/* Botón agregar movimiento */}
        <button
          onClick={() => setShowMovModal(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 py-3 rounded-xl text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Agregar movimiento
        </button>
      </div>

      {/* Modal movimiento */}
      {showMovModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMovModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold">Nuevo movimiento</h3>
              <button onClick={() => setShowMovModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setMovError('');
                addMovMutation.mutate({ ...movForm, amount: Number(movForm.amount) });
              }}
              className="px-5 py-4 space-y-4"
            >
              {movError && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm px-3 py-2 rounded-lg">
                  {movError}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Fecha *</label>
                <input
                  type="date"
                  value={movForm.date}
                  onChange={(e) => setMovForm((f) => ({ ...f, date: e.target.value }))}
                  required
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Descripción *</label>
                <input
                  type="text"
                  value={movForm.description}
                  onChange={(e) => setMovForm((f) => ({ ...f, description: e.target.value }))}
                  required
                  placeholder="ej. Uber Eats"
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Monto *</label>
                <input
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={movForm.amount}
                  onChange={(e) => setMovForm((f) => ({ ...f, amount: Number(e.target.value) }))}
                  required
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Categoría</label>
                <select
                  value={movForm.category}
                  onChange={(e) => setMovForm((f) => ({ ...f, category: e.target.value }))}
                  className="input-base"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={movForm.isMsi}
                  onChange={(e) => setMovForm((f) => ({ ...f, isMsi: e.target.checked }))}
                  className="h-4 w-4 rounded text-indigo-600"
                />
                <span className="text-sm">Es compra a MSI</span>
              </label>
              <button
                type="submit"
                disabled={addMovMutation.isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {addMovMutation.isPending ? 'Guardando...' : 'Guardar movimiento'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
