import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { adminApi } from '../../api/admin';
import { AggregationPeriod } from '../../types/admin';

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: '#10B981',
  SHIPPED: '#8B5CF6',
  PACKED: '#6366F1',
  CONFIRMED: '#3B82F6',
  PENDING: '#F59E0B',
  CANCELLED: '#EF4444',
  RETURN_REQUESTED: '#EC4899',
  RETURNED: '#64748B',
};

export function AnalyticsChartsSection() {
  const [period, setPeriod] = useState<AggregationPeriod>('monthly');

  const { data: revenueData = [] } = useQuery({
    queryKey: ['admin-revenue', period],
    queryFn: () => adminApi.getRevenueAnalytics({ period }),
  });

  const { data: orderStatusData = [] } = useQuery({
    queryKey: ['admin-order-status'],
    queryFn: () => adminApi.getOrderStatusBreakdown(),
  });

  const { data: topCategoriesData = [] } = useQuery({
    queryKey: ['admin-top-categories'],
    queryFn: () => adminApi.getTopCategories(),
  });

  const formattedStatusData = orderStatusData.map((item) => ({
    ...item,
    color: STATUS_COLORS[item.status] || '#94A3B8',
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Main Revenue Analytics Area Chart */}
      <div className="bg-white border border-gray-100 rounded-xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2.5 sm:gap-4">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-brand-slate-dark">Revenue Trends</h3>
            <p className="text-[10px] sm:text-xs text-slate-400">Total gross earnings and order volume over time</p>
          </div>

          {/* Period Switcher */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl sm:rounded-2xl flex-wrap gap-y-1">
            {(['daily', 'weekly', 'monthly', 'yearly'] as AggregationPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`text-[9px] sm:text-[10px] font-extrabold uppercase px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl transition-all ${
                  period === p
                    ? 'bg-brand-crimson text-white shadow-sm'
                    : 'text-slate-500 hover:text-brand-slate-dark'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="h-56 sm:h-72 w-full pt-2 sm:pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8A002C" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8A002C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="period" stroke="#64748B" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={10} tickLine={false} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(val: any) => [`₹${Number(val || 0).toLocaleString('en-IN')}`, 'Revenue']}
                contentStyle={{ borderRadius: '12px', borderColor: '#E2E8F0', fontSize: '11px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#8A002C" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Grid of Secondary Charts: Order Status & Category Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Order Status Breakdown (Donut Chart) */}
        <div className="bg-white border border-gray-100 rounded-xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-brand-slate-dark">Order Status Breakdown</h3>
            <p className="text-[10px] sm:text-xs text-slate-400">Distribution across active order states</p>
          </div>

          <div className="h-56 sm:h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="status"
                >
                  {formattedStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [val, 'Orders']} />
                <Legend formatter={(val) => <span className="text-[10px] sm:text-xs font-bold text-slate-600">{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Category Revenue (Bar Chart) */}
        <div className="bg-white border border-gray-100 rounded-xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-brand-slate-dark">Top Category Performance</h3>
            <p className="text-[10px] sm:text-xs text-slate-400">Total revenue contribution per category</p>
          </div>

          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCategoriesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="categoryName" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} />
                <Tooltip formatter={(val: any) => [`₹${Number(val || 0).toLocaleString('en-IN')}`, 'Revenue']} />
                <Bar dataKey="totalRevenue" fill="#0F172A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsChartsSection;
