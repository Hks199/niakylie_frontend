import { IndianRupee, ShoppingBag, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { DashboardSummary } from '../../types/admin';

interface KpiSummaryGridProps {
  kpis: DashboardSummary;
}

export function KpiSummaryGrid({ kpis }: KpiSummaryGridProps) {
  const stockAlertsTotal = (kpis.inventoryAlerts?.outOfStockCount || 0) + (kpis.inventoryAlerts?.lowStockCount || 0);

  const cards = [
    {
      title: 'Total Revenue',
      value: `₹${(kpis.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      iconBg: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      title: 'Total Orders',
      value: (kpis.totalOrders || 0).toLocaleString('en-IN'),
      icon: ShoppingBag,
      iconBg: 'bg-blue-500/10 text-blue-600',
    },
    {
      title: 'Avg Order Value',
      value: `₹${Math.round(kpis.averageOrderValue || 0).toLocaleString('en-IN')}`,
      icon: TrendingUp,
      iconBg: 'bg-purple-500/10 text-purple-600',
    },
    {
      title: 'Total Customers',
      value: (kpis.totalCustomers || 0).toLocaleString('en-IN'),
      icon: Users,
      iconBg: 'bg-indigo-500/10 text-indigo-600',
    },
    {
      title: 'Inventory Alerts',
      value: stockAlertsTotal,
      icon: AlertTriangle,
      iconBg: stockAlertsTotal > 0 ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white border border-gray-100 rounded-xl sm:rounded-3xl p-3 sm:p-5 shadow-sm space-y-2 sm:space-y-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                {card.title}
              </span>
              <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-2xl ${card.iconBg}`}>
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-base sm:text-xl font-extrabold text-brand-slate-dark tracking-tight truncate">
                {card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default KpiSummaryGrid;
