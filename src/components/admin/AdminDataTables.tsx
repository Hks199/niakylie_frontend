import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Package, Users, AlertCircle } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { InventoryAlertItem } from '../../types/admin';
import { formatImageUrl } from '../../utils/imageUtils';

interface AdminDataTablesProps {
  showInventoryAlerts?: boolean;
  showTopProductsAndCustomers?: boolean;
}

const resolveProductImage = (item: any): string => {
  if (!item) return formatImageUrl(null);
  const imgPath =
    item.image ||
    item.imageUrl ||
    (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null) ||
    item.productImage ||
    item.thumbnail ||
    item.product?.image ||
    item.product?.imageUrl ||
    (Array.isArray(item.product?.images) && item.product.images.length > 0 ? item.product.images[0] : null);

  return formatImageUrl(imgPath);
};

export function AdminDataTables({
  showInventoryAlerts = true,
  showTopProductsAndCustomers = true,
}: AdminDataTablesProps) {
  const [restockingSku, setRestockingSku] = useState<string | null>(null);

  const { data: topProducts = [], refetch: refetchTopProducts, isRefetching: isRefetchingTopProducts } = useQuery({
    queryKey: ['admin-top-products'],
    queryFn: () => adminApi.getTopProducts(),
    enabled: showTopProductsAndCustomers,
  });

  const { data: topCustomers = [], refetch: refetchTopCustomers, isRefetching: isRefetchingTopCustomers } = useQuery({
    queryKey: ['admin-top-customers'],
    queryFn: () => adminApi.getTopCustomers(),
    enabled: showTopProductsAndCustomers,
  });

  const { data: inventoryReport, refetch: refetchInventory, isRefetching: isRefetchingInventory } = useQuery({
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
    <div className="space-y-4 sm:space-y-8">
      {/* 1. Inventory Health Alerts Table (Only shown if showInventoryAlerts is true) */}
      {showInventoryAlerts && (
        <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 flex-shrink-0" />
              <div>
                <h3 className="text-xs sm:text-base font-extrabold text-brand-slate-dark">Inventory Health Alerts</h3>
                <p className="text-[9px] sm:text-xs text-slate-400">Products requiring immediate restocking action</p>
              </div>
            </div>

            <button
              onClick={() => refetchInventory()}
              disabled={isRefetchingInventory}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-gray-200 text-slate-600 transition-colors disabled:opacity-50"
              title="Refresh Inventory Alerts"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefetchingInventory ? 'animate-spin text-brand-crimson' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="border-b border-gray-100 text-[9px] sm:text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                  <th className="py-2 sm:py-3 pl-1">Product Info</th>
                  <th className="py-2 sm:py-3 px-2">SKU</th>
                  <th className="py-2 sm:py-3 px-2 text-center">Available</th>
                  <th className="py-2 sm:py-3 px-2 text-center">Threshold</th>
                  <th className="py-2 sm:py-3 px-2 text-center">Status</th>
                  <th className="py-2 sm:py-3 pr-1 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs font-medium text-slate-700">
                {allAlertItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-semibold">
                      ✓ Healthy stock levels! No inventory alerts recorded.
                    </td>
                  </tr>
                ) : (
                  allAlertItems.map((item) => {
                    const isOut = item.availableQuantity <= 0;
                    const itemImg = resolveProductImage(item);
                    return (
                      <tr key={item.sku} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 pl-1">
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={itemImg}
                              alt={item.productName || 'Product'}
                              className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl object-cover border border-gray-200 flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = formatImageUrl(null);
                              }}
                            />
                            <div className="min-w-0">
                              <p className="text-[11px] sm:text-xs font-extrabold text-brand-slate-dark truncate max-w-[100px] sm:max-w-none">
                                {item.productName}
                              </p>
                              {item.attributes && (
                                <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold truncate">
                                  {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-[9px] sm:text-[11px] font-mono text-slate-500 font-bold whitespace-nowrap">
                          {item.sku}
                        </td>
                        <td className="py-2.5 px-2 text-center text-[10px] sm:text-xs font-extrabold text-rose-600">
                          {item.availableQuantity}
                        </td>
                        <td className="py-2.5 px-2 text-center text-[10px] sm:text-xs font-semibold text-slate-400">
                          {item.lowStockThreshold ?? 5}
                        </td>
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          <span
                            className={`text-[8px] sm:text-[9px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded-full ${
                              isOut ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isOut ? 'Out of Stock' : 'Low Stock'}
                          </span>
                        </td>
                        <td className="py-2.5 pr-1 text-right">
                          <button
                            onClick={() => handleRestock(item)}
                            disabled={restockingSku === item.sku}
                            className="inline-flex items-center space-x-1 bg-brand-crimson hover:bg-brand-crimson-dark text-white text-[9px] sm:text-[10px] font-extrabold px-2 sm:px-2.5 py-1 rounded-md sm:rounded-lg transition-all shadow-sm disabled:opacity-50"
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
          <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-brand-crimson flex-shrink-0" />
                <div>
                  <h3 className="text-xs sm:text-base font-extrabold text-brand-slate-dark">Top Selling Products</h3>
                  <p className="text-[9px] sm:text-xs text-slate-400">Highest volume revenue generators</p>
                </div>
              </div>

              <button
                onClick={() => refetchTopProducts()}
                disabled={isRefetchingTopProducts}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-gray-200 text-slate-600 transition-colors disabled:opacity-50"
                title="Refresh Top Products"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefetchingTopProducts ? 'animate-spin text-brand-crimson' : ''}`} />
              </button>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {topProducts.length === 0 ? (
                <p className="text-[11px] sm:text-xs text-slate-400 py-4 text-center font-semibold">No product sales recorded yet.</p>
              ) : (
                topProducts.map((prod, index) => {
                  const prodImg = resolveProductImage(prod);
                  return (
                    <div key={prod.productId || prod.sku} className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50/70 hover:bg-slate-100/70 transition-colors border border-gray-100/80">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                        <span className="text-[10px] sm:text-xs font-black text-slate-400 w-4 text-center flex-shrink-0">
                          #{index + 1}
                        </span>
                        <img
                          src={prodImg}
                          alt={prod.productName || 'Product'}
                          className="w-7 h-9 sm:w-10 sm:h-12 rounded-lg sm:rounded-xl object-cover border border-gray-200 flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = formatImageUrl(null);
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-[11px] sm:text-xs font-extrabold text-brand-slate-dark truncate">{prod.productName}</p>
                          <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono truncate">{prod.sku}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-[11px] sm:text-xs font-extrabold text-brand-crimson">₹{(prod.totalRevenue || 0).toLocaleString('en-IN')}</p>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">{prod.totalQuantitySold} sold</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Top Spending Customers Table */}
          <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
                <div>
                  <h3 className="text-xs sm:text-base font-extrabold text-brand-slate-dark">Top Spending Customers</h3>
                  <p className="text-[9px] sm:text-xs text-slate-400">Highest lifetime customer value</p>
                </div>
              </div>

              <button
                onClick={() => refetchTopCustomers()}
                disabled={isRefetchingTopCustomers}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-gray-200 text-slate-600 transition-colors disabled:opacity-50"
                title="Refresh Top Customers"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefetchingTopCustomers ? 'animate-spin text-brand-crimson' : ''}`} />
              </button>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {topCustomers.length === 0 ? (
                <p className="text-[11px] sm:text-xs text-slate-400 py-4 text-center font-semibold">No customer order history yet.</p>
              ) : (
                topCustomers.map((cust, index) => (
                  <div key={cust.userId || cust.email} className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50/70 hover:bg-slate-100/70 transition-colors border border-gray-100/80">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                      <span className="text-[10px] sm:text-xs font-black text-slate-400 w-4 text-center flex-shrink-0">
                        #{index + 1}
                      </span>
                      <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-[10px] sm:text-xs flex-shrink-0 border border-indigo-200/60">
                        {cust.name ? cust.name[0].toUpperCase() : 'C'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] sm:text-xs font-extrabold text-brand-slate-dark truncate">{cust.name || 'Customer'}</p>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">{cust.email}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-[11px] sm:text-xs font-extrabold text-brand-slate-dark">₹{(cust.totalSpent || 0).toLocaleString('en-IN')}</p>
                      <span className="inline-block text-[8px] sm:text-[9px] font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-100">
                        {cust.orderCount} orders
                      </span>
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
