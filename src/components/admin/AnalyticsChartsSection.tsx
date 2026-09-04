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

const CustomRevenueTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900/95 text-white text-[8px] sm:text-[10px] px-2 py-1 sm:p-2 rounded-lg sm:rounded-xl shadow-lg border border-slate-800 backdrop-blur-md pointer-events-none max-w-[130px]">
        <p className="font-bold text-slate-300 border-b border-slate-800/80 pb-0.5 mb-0.5 truncate">{label}</p>
        <p className="font-black text-rose-400 leading-tight">
          ₹{Number(data.value || 0).toLocaleString('en-IN')}
        </p>
        {data.payload?.orders !== undefined && (
          <p className="text-[7.5px] sm:text-[9px] text-slate-400 font-medium leading-tight">
            {data.payload.orders} orders
          </p>
        )}
      </div>
    );
  }
  return null;
};

const CustomStatusTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900/95 text-white text-[8px] sm:text-[10px] px-2 py-1 sm:p-2 rounded-lg sm:rounded-xl shadow-lg border border-slate-800 backdrop-blur-md pointer-events-none max-w-[120px]">
        <p className="font-bold text-slate-300 border-b border-slate-800/80 pb-0.5 mb-0.5 truncate">{data.name}</p>
        <p className="font-black leading-tight" style={{ color: data.payload?.color || '#3B82F6' }}>
          {data.value} <span className="text-white text-[7.5px] font-normal">orders</span>
        </p>
        {data.payload?.totalValue !== undefined && (
          <p className="text-[7.5px] sm:text-[9px] text-slate-400 font-medium leading-tight">
            ₹{Number(data.payload.totalValue).toLocaleString('en-IN')}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const CustomCategoryTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900/95 text-white text-[8px] sm:text-[10px] px-2 py-1 sm:p-2 rounded-lg sm:rounded-xl shadow-lg border border-slate-800 backdrop-blur-md pointer-events-none max-w-[130px]">
        <p className="font-bold text-slate-300 border-b border-slate-800/80 pb-0.5 mb-0.5 truncate">{label}</p>
        <p className="font-black text-emerald-400 leading-tight">
          ₹{Number(data.value || 0).toLocaleString('en-IN')}
        </p>
        {data.payload?.itemsSold !== undefined && (
          <p className="text-[7.5px] sm:text-[9px] text-slate-400 font-medium leading-tight">
            {data.payload.itemsSold} sold
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function AnalyticsChartsSection() {
  const [period, setPeriod] = useState<AggregationPeriod>('monthly');
  const [activePieIndex, setActivePieIndex] = useState<number | null>(0);

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

  const totalStatusOrders = formattedStatusData.reduce((sum, item) => sum + (item.count || 0), 0);

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

        <div className="h-56 sm:h-72 w-full pt-2 sm:pt-4 relative" style={{ touchAction: 'pan-y' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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
                content={<CustomRevenueTooltip />}
                allowEscapeViewBox={{ x: true, y: true }}
                wrapperStyle={{ zIndex: 1000, outline: 'none' }}
                isAnimationActive={false}
                useTranslate3d={false}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8A002C"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                isAnimationActive={false}
                activeDot={{ r: 6, stroke: '#8A002C', strokeWidth: 2, fill: '#FFFFFF' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Grid of Secondary Charts: Order Status & Category Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Order Status Breakdown (Donut Chart with Touch Interactive Badges) */}
        <div className="bg-white border border-gray-100 rounded-xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm space-y-3 sm:space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-brand-slate-dark">Order Status Breakdown</h3>
                <p className="text-[10px] sm:text-xs text-slate-400">Distribution across active order states</p>
              </div>
              {activePieIndex !== null && (
                <button
                  onClick={() => setActivePieIndex(null)}
                  className="text-[9px] sm:text-[10px] font-extrabold text-brand-crimson bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 hover:bg-rose-100 transition-colors"
                >
                  ALL ORDERS
                </button>
              )}
            </div>

            {/* Active Status Header Detail Card (Mobile 320px Standard) */}
            <div className="bg-slate-900 text-white p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-sm border border-slate-800 flex items-center justify-between transition-all">
              <div className="flex items-center space-x-2 min-w-0">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0 animate-pulse"
                  style={{
                    backgroundColor:
                      activePieIndex !== null && formattedStatusData[activePieIndex]
                        ? formattedStatusData[activePieIndex].color
                        : '#10B981',
                  }}
                />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-black uppercase text-slate-200 truncate">
                    {activePieIndex !== null && formattedStatusData[activePieIndex]
                      ? formattedStatusData[activePieIndex].status
                      : 'Combined Breakdown'}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold truncate">
                    {activePieIndex !== null && formattedStatusData[activePieIndex]?.totalValue !== undefined
                      ? `Total Revenue: ₹${Number(formattedStatusData[activePieIndex].totalValue).toLocaleString('en-IN')}`
                      : 'Tap status below or pie slice to inspect'}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-xs sm:text-sm font-black text-rose-400">
                  {activePieIndex !== null && formattedStatusData[activePieIndex]
                    ? `${formattedStatusData[activePieIndex].count} Orders`
                    : `${totalStatusOrders} Total`}
                </p>
              </div>
            </div>

            {/* Interactive Pie Container */}
            <div className="h-44 sm:h-52 flex items-center justify-center relative pt-1" style={{ touchAction: 'pan-y' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Tooltip
                    content={<CustomStatusTooltip />}
                    allowEscapeViewBox={{ x: true, y: true }}
                    wrapperStyle={{ zIndex: 1000, outline: 'none' }}
                    isAnimationActive={false}
                    useTranslate3d={false}
                  />
                  <Pie
                    data={formattedStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="status"
                    isAnimationActive={false}
                    onClick={(_, index) => setActivePieIndex(activePieIndex === index ? null : index)}
                    onTouchStart={(_, index) => setActivePieIndex(index)}
                    onMouseEnter={(_, index) => setActivePieIndex(index)}
                  >
                    {formattedStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={activePieIndex === index ? '#0F172A' : '#FFFFFF'}
                        strokeWidth={activePieIndex === index ? 3 : 1}
                        style={{
                          transform: activePieIndex === index ? 'scale(1.06)' : 'scale(1)',
                          transformOrigin: 'center center',
                          transition: 'all 0.2s ease-in-out',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Total Count Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs sm:text-base font-black text-brand-slate-dark">
                  {activePieIndex !== null && formattedStatusData[activePieIndex]
                    ? formattedStatusData[activePieIndex].count
                    : totalStatusOrders}
                </span>
                <span className="text-[8px] sm:text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">
                  {activePieIndex !== null && formattedStatusData[activePieIndex]
                    ? formattedStatusData[activePieIndex].status
                    : 'Total Orders'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Mobile Legend Grid for 320px Standards */}
          <div className="grid grid-cols-2 gap-1.5 pt-3 border-t border-gray-100">
            {formattedStatusData.map((item, idx) => {
              const pct = totalStatusOrders > 0 ? Math.round(((item.count || 0) / totalStatusOrders) * 100) : 0;
              const isActive = activePieIndex === idx;

              return (
                <button
                  key={item.status}
                  onClick={() => setActivePieIndex(isActive ? null : idx)}
                  className={`flex items-center justify-between p-1.5 sm:p-2 rounded-xl text-left border transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-gray-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[9px] sm:text-[10px] font-extrabold truncate">
                      {item.status}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-1">
                    <span className="text-[9px] sm:text-[10px] font-black block leading-none">
                      {item.count}
                    </span>
                    <span className={`text-[8px] font-semibold ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                      {pct}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Top Category Revenue (Bar Chart) */}
        <div className="bg-white border border-gray-100 rounded-xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-brand-slate-dark">Top Category Performance</h3>
            <p className="text-[10px] sm:text-xs text-slate-400">Total revenue contribution per category</p>
          </div>

          <div className="h-56 sm:h-64 w-full relative" style={{ touchAction: 'pan-y' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCategoriesData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="categoryName" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} />
                <Tooltip
                  content={<CustomCategoryTooltip />}
                  allowEscapeViewBox={{ x: true, y: true }}
                  wrapperStyle={{ zIndex: 1000, outline: 'none' }}
                  isAnimationActive={false}
                  useTranslate3d={false}
                />
                <Bar
                  dataKey="totalRevenue"
                  fill="#0F172A"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={false}
                  activeBar={{ fill: '#8A002C' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsChartsSection;
