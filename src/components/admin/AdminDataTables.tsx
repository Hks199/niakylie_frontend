import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Package, Users, AlertCircle } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { InventoryAlertItem } from '../../types/admin';

interface AdminDataTablesProps {
  showInventoryAlerts?: boolean;
  showTopProductsAndCustomers?: boolean;
}

export function AdminDataTables({
  showInventoryAlerts = true,
  showTopProductsAndCustomers = true,
}: AdminDataTablesProps) {
  const [restockingSku, setRestockingSku] = useState<string | null>(null);

  const { data: topProducts = [] } = useQuery({
    queryKey: ['admin-top-products'],
    queryFn: () => adminApi.getTopProducts(),
    enabled: showTopProductsAndCustomers,
  });

  const { data: topCustomers = [] } = useQuery({
    queryKey: ['admin-top-customers'],
    queryFn: () => adminApi.getTopCustomers(),
    enabled: showTopProductsAndCustomers,
  });

  const { data: inventoryReport, refetch: refetchInventory } = useQuery({
    queryKey: ['admin-inventory-alerts'],
    queryFn: () => adminApi.getInventoryAlerts(),
    enabled: showInventoryAlerts,
  });

  const allAlertItems: InventoryAlertItem[] = [
    ...(inventoryReport?.outOfStockItems || []),
    ...(inventoryReport?.lowStockItems || []),
  ];

  const handleRestock = async (item: InventoryAlertItem) => {
    setRestockingSku(item.sku);
    try {
      await adminApi.adjustStock({
        sku: item.sku,
        quantityChange: 25,
        reason: 'PURCHASE_ORDER',
        note: 'Restocked from Admin Dashboard UI',
      });
      await refetchInventory();
    } catch (err) {
      console.error('Failed to restock inventory', err);
    } finally {
      setRestockingSku(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Inventory Health Alerts Table (Only shown if showInventoryAlerts is true) */}
      {showInventoryAlerts && (
        <div className="bg-white border border-gray-100 rounded-xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-brand-slate-dark">Inventory Health Alerts</h3>
              <p className="text-[10px] sm:text-xs text-slate-400">Products requiring immediate restocking action</p>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-100 text-[9px] sm:text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                  <th className="pb-2.5 pl-1.5">Product</th>
                  <th className="pb-2.5">SKU</th>
                  <th className="pb-2.5">Available Stock</th>
                  <th className="pb-2.5">Reorder Threshold</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 pr-1.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-[11px] sm:text-xs font-semibold">
                {allAlertItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 text-xs font-medium">
                      All inventory levels are healthy! No restock alerts needed right now.
                    </td>
                  </tr>
                ) : (
                  allAlertItems.map((item) => {
                    const isOut = item.availableQuantity === 0;
                    return (
                      <tr key={item.inventoryId || item.sku} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 pl-1.5 flex items-center space-x-2.5">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-100 border border-gray-100 flex items-center justify-center flex-shrink-0 text-brand-slate font-bold text-xs">
                            {item.productName ? item.productName[0] : 'P'}
                          </div>
                          <span className="font-extrabold text-brand-slate-dark truncate max-w-[120px] sm:max-w-none">{item.productName || item.sku}</span>
                        </td>
                        <td className="py-2.5 text-slate-500 font-mono text-[10px] sm:text-[11px]">{item.sku}</td>
                        <td className="py-2.5 font-extrabold text-brand-slate-dark">{item.availableQuantity} units</td>
                        <td className="py-2.5 text-slate-400">{item.lowStockThreshold ?? 5} units</td>
                        <td className="py-2.5">
                          <span
                            className={`text-[8px] sm:text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              isOut ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isOut ? 'Out of Stock' : 'Low Stock'}
                          </span>
                        </td>
                        <td className="py-2.5 pr-1.5 text-right">
                          <button
                            onClick={() => handleRestock(item)}
                            disabled={restockingSku === item.sku}
                            className="inline-flex items-center space-x-1 bg-brand-crimson hover:bg-brand-crimson-dark text-white text-[9px] sm:text-[10px] font-extrabold px-2.5 py-1 rounded-md sm:rounded-lg transition-all shadow-sm disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 ${restockingSku === item.sku ? 'animate-spin' : ''}`} />
                            <span>RESTOCK (+25)</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Top Products & Top Customers (Only shown if showTopProductsAndCustomers is true) */}
      {showTopProductsAndCustomers && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Top Selling Products Table */}
          <div className="bg-white border border-gray-100 rounded-xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-brand-crimson flex-shrink-0" />
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-brand-slate-dark">Top Selling Products</h3>
                <p className="text-[10px] sm:text-xs text-slate-400">Highest volume revenue generators</p>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {topProducts.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center font-semibold">No product sales recorded yet.</p>
              ) : (
                topProducts.map((prod) => (
                  <div key={prod.productId || prod.sku} className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50/70 hover:bg-slate-100/70 transition-colors">
                    <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                      {prod.image ? (
                        <img src={prod.image} alt={prod.productName} className="w-8 h-10 sm:w-10 sm:h-12 rounded-lg sm:rounded-xl object-cover border border-gray-200 flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-10 sm:w-10 sm:h-12 rounded-lg sm:rounded-xl bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs flex-shrink-0">
                          NK
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[11px] sm:text-xs font-extrabold text-brand-slate-dark truncate">{prod.productName}</p>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono">{prod.sku}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-[11px] sm:text-xs font-extrabold text-brand-crimson">₹{(prod.totalRevenue || 0).toLocaleString('en-IN')}</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">{prod.totalQuantitySold} sold</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Spending Customers Table */}
          <div className="bg-white border border-gray-100 rounded-xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-brand-slate-dark">Top Spending Customers</h3>
                <p className="text-[10px] sm:text-xs text-slate-400">Highest lifetime customer value</p>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {topCustomers.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center font-semibold">No customer order history yet.</p>
              ) : (
                topCustomers.map((cust) => (
                  <div key={cust.userId || cust.email} className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50/70 hover:bg-slate-100/70 transition-colors">
                    <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-xs flex-shrink-0">
                        {cust.name ? cust.name[0] : 'C'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] sm:text-xs font-extrabold text-brand-slate-dark truncate">{cust.name}</p>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">{cust.email}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-[11px] sm:text-xs font-extrabold text-brand-slate-dark">₹{(cust.totalSpent || 0).toLocaleString('en-IN')}</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">{cust.orderCount} orders</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDataTables;
