'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatCurrency, availabilityColor } from '@/lib/utils';
import { TrendingUp, TrendingDown, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface PeriodSummary {
  period: {
    _id: string;
    startDate: string;
    endDate: string;
    quinc?: 1 | 2;
    type: string;
  };
  income: { salary: number; extra: number; total: number };
  expenses: { fixed: number; variable: number; apartados: number; tcPayments: number; msi: number; total: number };
  available: number;
  availablePct: number;
  activeMsi: Array<{ concept: string; monthlyAmount: number; pendingMonths: number }>;
}

function SectionRow({ label, amount, children, defaultOpen = false }: {
  label: string; amount: number; children?: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <button
        onClick={() => children && setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{formatCurrency(amount)}</span>
          {children && (open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />)}
        </div>
      </button>
      {open && children && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { data: current } = useQuery({
    queryKey: ['period', 'current'],
    queryFn: () => api.get('/periods/current').then((r) => r.data),
  });

  const { data: summary, isLoading } = useQuery<PeriodSummary>({
    queryKey: ['period-summary', current?._id],
    queryFn: () => api.get(`/periods/${current._id}/summary`).then((r) => r.data),
    enabled: !!current?._id,
  });

  if (isLoading || !summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const { income, expenses, available, availablePct, period, activeMsi } = summary;
  const availColor = availabilityColor(availablePct);
  const quincLabel = period.quinc
    ? `${period.quinc === 1 ? '1a' : '2a'} Quincena`
    : 'Período mensual';

  return (
    <div className="flex flex-col pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">{quincLabel}</p>
            <h2 className="text-lg font-bold">
              {new Date(period.startDate).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
            </h2>
          </div>
          <div className="flex gap-2">
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">&#x276E;</button>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">&#x276F;</button>
          </div>
        </div>
      </header>

      {/* Disponible hero */}
      <div className={`mx-4 mt-4 rounded-2xl p-5 ${availablePct > 30 ? 'bg-green-50 dark:bg-green-900/20' : availablePct > 10 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
        <p className="text-xs text-gray-500 mb-1">Disponible real</p>
        <p className={`text-3xl font-bold ${availColor}`}>{formatCurrency(available)}</p>
        <p className="text-xs text-gray-500 mt-1">de {formatCurrency(income.total)} de ingreso · {availablePct}% libre</p>
      </div>

      {/* Secciones */}
      <div className="mx-4 mt-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden">
        <SectionRow label="Ingresos" amount={income.total} defaultOpen>
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Nómina</span><span>{formatCurrency(income.salary)}</span>
            </div>
            {income.extra > 0 && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Extras</span><span>{formatCurrency(income.extra)}</span>
              </div>
            )}
          </div>
        </SectionRow>

        <SectionRow label="Pagos Fijos" amount={expenses.fixed}>
          <p className="text-xs text-gray-400">Servicios domiciliados y pagos recurrentes</p>
        </SectionRow>

        {expenses.msi > 0 && (
          <SectionRow label="MSI Activos" amount={expenses.msi}>
            <div className="space-y-1 pt-1">
              {activeMsi.map((m) => (
                <div key={m.concept} className="flex justify-between text-xs text-gray-500">
                  <span>{m.concept} ({m.pendingMonths} pend.)</span>
                  <span>{formatCurrency(m.monthlyAmount)}</span>
                </div>
              ))}
            </div>
          </SectionRow>
        )}

        {expenses.variable > 0 && (
          <SectionRow label="Variables / Imprevistos" amount={expenses.variable} />
        )}

        {expenses.apartados > 0 && (
          <SectionRow label="Apartados" amount={expenses.apartados}>
            <p className="text-xs text-gray-400">Gasolina, TAG, Uber</p>
          </SectionRow>
        )}

        {expenses.tcPayments > 0 && (
          <SectionRow label="Pagos de Tarjetas" amount={expenses.tcPayments} />
        )}
      </div>

      {/* Totales */}
      <div className="mx-4 mt-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Total compromisos</span>
          <span className="font-semibold text-red-600">{formatCurrency(expenses.total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Disponible</span>
          <span className={`font-bold text-base ${availColor}`}>{formatCurrency(available)}</span>
        </div>
      </div>

      {/* Acciones */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
        <button className="bg-indigo-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
          + Agregar gasto
        </button>
        <button className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Ver tarjetas
        </button>
      </div>
    </div>
  );
}
