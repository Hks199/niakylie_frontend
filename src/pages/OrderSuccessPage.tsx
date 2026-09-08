import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Package, Truck, Download, ArrowRight } from 'lucide-react';
import { ordersApi } from '../api/orders';
import { NIAKYLIE_LOGO_BASE64 } from '../utils/logoBase64';

import { useEffect } from 'react';
import { useCartStore } from '../store/useCartStore';


interface OrderSuccessPageProps {
  orderId?: string;
}

export function OrderSuccessPage({ orderId = '' }: OrderSuccessPageProps) {
  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getOrderDetails(orderId),
    enabled: !!orderId,
  });

  useEffect(() => {
    useCartStore.getState().clearCart();
  }, []);


  const displayOrderId = order?.orderId || orderId;
  const estimatedDelivery = order?.estimatedDelivery || (() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' });
  })();

  const orderTotal =
    order?.totals?.total ??
    order?.pricing?.grandTotal ??
    order?.grandTotal ??
    0;

  const handleDownloadReceipt = async () => {
    let htmlContent = '';
    // Embed the logo so mobile print/PDF viewers do not lose a remote image while loading.
    const logoUrl = NIAKYLIE_LOGO_BASE64;

    try {
      const invoiceData = await ordersApi.getInvoice(orderId || displayOrderId);
      if (invoiceData && invoiceData.htmlTemplate) {
        htmlContent = invoiceData.htmlTemplate;
        htmlContent = htmlContent.replace(
          /(<img\b[^>]*\bsrc=["'])[^"']+(["'][^>]*>)/i,
          `$1${logoUrl}$2`,
        );
        if (!htmlContent.includes('<base')) {
          htmlContent = htmlContent.replace('<head>', `<head><base href="${window.location.origin}/" />`);
        }
        if (!htmlContent.includes('window.print()')) {
          htmlContent = htmlContent.replace('</body>', '<script>window.onload = function() { window.print(); };</script></body>');
        }
      }
    } catch (e) {
      // Fallback
    }

    if (!htmlContent) {
      const orderAny = order as any;
      const itemsList = (orderAny?.items || []).map((item: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #64748b;">${item.sku || 'NK-SKU'}</td>
          <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">
            <strong>${item.name || item.title || 'NiaKylie Fashion Item'}</strong>
            ${item.color || item.size ? `<br><span style="font-size: 11px; color: #94a3b8;">Variant: ${[item.color, item.size].filter(Boolean).join(' / ')}</span>` : ''}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: center; font-weight: bold; color: #0f172a;">${item.quantity || 1}</td>
          <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #475569;">₹${(item.unitPrice || item.price || 0).toLocaleString('en-IN')}</td>
          <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold; color: #0f172a;">₹${((item.unitPrice || item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</td>
        </tr>
      `).join('');

      const subtotal = orderAny?.totals?.subtotal || orderAny?.pricing?.subtotal || orderTotal;
      const couponDiscount = orderAny?.totals?.couponDiscount || orderAny?.pricing?.couponDiscount || 0;
      const onlinePaymentDiscount = orderAny?.totals?.onlinePaymentDiscount || orderAny?.pricing?.onlinePaymentDiscount || 0;
      const shippingFee = orderAny?.totals?.shippingFee || orderAny?.pricing?.shippingFee || 0;

      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt - ${displayOrderId}</title>
          <meta charset="utf-8" />
          <style>
            @media print {
              body { margin: 0; padding: 20px; box-shadow: none !important; border: none !important; }
              .no-print { display: none !important; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #1e293b;
              max-width: 800px;
              margin: 40px auto;
              padding: 32px;
              border: 1px solid #e2e8f0;
              border-radius: 24px;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
              background: #ffffff;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #e63946;
              padding-bottom: 24px;
              margin-bottom: 24px;
            }
            .brand-name {
              font-size: 32px;
              font-weight: 900;
              color: #e63946;
              letter-spacing: -1px;
            }
            .brand-tag {
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #64748b;
              margin-top: 4px;
            }
            .invoice-title { text-align: right; }
            .invoice-title h2 { margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; }
            .meta { font-size: 13px; color: #64748b; margin-top: 6px; }
            .section-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 24px;
              font-size: 13px;
            }
            .card {
              background: #f8fafc;
              padding: 16px 20px;
              border-radius: 16px;
              border: 1px solid #f1f5f9;
              line-height: 1.6;
            }
            .card h4 {
              margin: 0 0 8px 0;
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #94a3b8;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 24px;
              font-size: 13px;
            }
            th {
              background: #f8fafc;
              color: #475569;
              font-weight: 800;
              text-transform: uppercase;
              font-size: 11px;
              letter-spacing: 0.5px;
              padding: 12px;
              text-align: left;
              border-bottom: 2px solid #e2e8f0;
            }
            .summary {
              margin-top: 24px;
              margin-left: auto;
              width: 320px;
              font-size: 13px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              color: #475569;
            }
            .summary-total {
              display: flex;
              justify-content: space-between;
              padding: 14px 0;
              border-top: 2px solid #e2e8f0;
              font-weight: 900;
              font-size: 18px;
              color: #e63946;
            }
            .footer {
              margin-top: 48px;
              padding-top: 24px;
              border-top: 1px solid #f1f5f9;
              text-align: center;
              font-size: 12px;
              color: #94a3b8;
            }
            .print-btn {
              display: block;
              width: 100%;
              max-width: 200px;
              margin: 0 auto 24px auto;
              padding: 12px 20px;
              background: #e63946;
              color: #ffffff;
              font-weight: 800;
              font-size: 12px;
              text-align: center;
              border-radius: 12px;
              border: none;
              cursor: pointer;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            @media screen and (max-width: 600px) {
              body { margin: 10px auto !important; padding: 14px !important; border-radius: 12px !important; width: 100% !important; box-sizing: border-box !important; }
              .header { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; padding-bottom: 14px !important; margin-bottom: 14px !important; }
              .invoice-title { text-align: left !important; }
              .invoice-title h2 { font-size: 16px !important; }
              .brand-tag { font-size: 9px !important; letter-spacing: 1px !important; }
              .meta { font-size: 11px !important; margin-top: 2px !important; }
              .section-grid { grid-template-columns: 1fr !important; gap: 10px !important; font-size: 11px !important; }
              .card { padding: 10px 12px !important; border-radius: 12px !important; }
              .card h4 { font-size: 9px !important; margin-bottom: 4px !important; }
              table { margin-top: 14px !important; font-size: 10px !important; }
              th, td { padding: 6px 4px !important; }
              th { font-size: 9px !important; }
              .summary { width: 100% !important; margin-top: 14px !important; font-size: 11px !important; }
              .summary-total { font-size: 14px !important; padding: 10px 0 !important; }
              .footer { margin-top: 24px !important; padding-top: 14px !important; font-size: 10px !important; }
              .print-btn { max-width: 100% !important; font-size: 10px !important; padding: 10px 12px !important; margin-bottom: 16px !important; }
            }
          </style>
        </head>
        <body>
          <button class="print-btn no-print" onclick="window.print()">🖨️ PRINT RECEIPT</button>

          <div class="header">
            <div>
              <img id="receipt-logo" src="${logoUrl}" onerror="this.onerror=null; this.src='${NIAKYLIE_LOGO_BASE64}';" alt="NiaKylie Logo" style="height: 60px; max-width: 220px; width: auto; object-fit: contain; display: block; margin-bottom: 6px;" />

              <div class="brand-tag">Luxury Ethnic Couture</div>
            </div>
            <div class="invoice-title">
              <h2>OFFICIAL RECEIPT</h2>
              <div class="meta"><strong>Order ID:</strong> ${displayOrderId}</div>
              <div class="meta"><strong>Date:</strong> ${new Date(orderAny?.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              <div class="meta"><strong>Status:</strong> CONFIRMED</div>
            </div>
          </div>



          <div class="section-grid">
            <div class="card">
              <h4>Billed / Shipped To</h4>
              <strong style="color: #0f172a; font-size: 14px;">${orderAny?.customerInfo?.firstName || 'Valued'} ${orderAny?.customerInfo?.lastName || 'Customer'}</strong><br>
              ${orderAny?.deliveryAddress?.street || orderAny?.shippingAddress?.street || 'Delivery Address'}<br>
              ${orderAny?.deliveryAddress?.city || orderAny?.shippingAddress?.city || ''}, ${orderAny?.deliveryAddress?.state || orderAny?.shippingAddress?.state || ''} ${orderAny?.deliveryAddress?.postalCode || orderAny?.shippingAddress?.postalCode || ''}<br>
              Phone: ${orderAny?.deliveryAddress?.phone || orderAny?.shippingAddress?.phone || orderAny?.customerInfo?.phone || 'N/A'}
            </div>
            <div class="card">
              <h4>Payment & Order Info</h4>
              <strong>Payment Method:</strong> ${(orderAny?.paymentMethod || 'COD').toUpperCase()}<br>
              <strong>Payment Status:</strong> ${(orderAny?.paymentStatus || 'COMPLETED').toUpperCase()}<br>
              <strong>Estimated Delivery:</strong> ${estimatedDelivery}
            </div>
          </div>


          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList.length > 0 ? itemsList : `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #64748b;">NK-SAREE-SILK</td>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a;"><strong>Designer Kanjivaram Silk Saree</strong></td>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: center; font-weight: bold; color: #0f172a;">1</td>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #475569;">₹${orderTotal.toLocaleString('en-IN')}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold; color: #0f172a;">₹${orderTotal.toLocaleString('en-IN')}</td>
                </tr>
              `}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>₹${subtotal.toLocaleString('en-IN')}</span>
            </div>
            ${couponDiscount > 0 ? `
              <div class="summary-row" style="color: #059669;">
                <span>Coupon Discount</span>
                <span>-₹${couponDiscount.toLocaleString('en-IN')}</span>
              </div>
            ` : ''}
            ${onlinePaymentDiscount > 0 ? `
              <div class="summary-row" style="color: #059669; font-weight: 700;">
                <span>Online Payment Extra Discount</span>
                <span>-₹${onlinePaymentDiscount.toLocaleString('en-IN')}</span>
              </div>
            ` : ''}
            <div class="summary-row">
              <span>GST Tax (0%)</span>
              <span>₹0</span>
            </div>
            <div class="summary-row">
              <span>Shipping Fee</span>
              <span>${shippingFee > 0 ? `₹${shippingFee.toLocaleString('en-IN')}` : 'FREE'}</span>
            </div>
            <div class="summary-total">
              <span>Amount Paid</span>
              <span>₹${orderTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0 0 4px 0; font-weight: 700; color: #475569;">Thank you for shopping with NiaKylie Fashion! ✨</p>
            <p style="margin: 0; font-size: 11px;">For support or returns, email niakylieofficial@gmail.com or call +91 95899 28337.</p>
          </div>

          <script>
            function doPrint() {
              setTimeout(function() {
                window.print();
              }, 400);
            }
            var logo = document.getElementById('receipt-logo');
            if (logo) {
              if (logo.complete && logo.naturalWidth > 0) {
                if ('decode' in logo) {
                  logo.decode().then(doPrint).catch(doPrint);
                } else {
                  doPrint();
                }
              } else {
                logo.onload = function() {
                  if ('decode' in logo) {
                    logo.decode().then(doPrint).catch(doPrint);
                  } else {
                    doPrint();
                  }
                };
                logo.onerror = doPrint;
              }
            } else {
              doPrint();
            }
          </script>

        </body>
        </html>
      `;
    }

    try {
      const printWindow = window.open('', '_blank');
      if (printWindow && !printWindow.closed) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
      } else {
        // Mobile browser fallback when popup is blocked
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
        const doc = iframe.contentWindow?.document || iframe.contentDocument;
        if (doc) {
          doc.open();
          doc.write(htmlContent);
          doc.close();
          setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 2000);
          }, 500);
        }
      }
    } catch (err) {
      console.error('Receipt print error:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-2.5 sm:px-6 py-6 sm:py-12 text-center animate-in fade-in duration-500">
      {/* Success Icon with pulse ring */}
      <div className="relative w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6">
        <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-40" />
        <div className="relative w-16 h-16 sm:w-24 sm:h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg sm:shadow-xl shadow-emerald-200">
          <CheckCircle2 className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
        </div>
      </div>

      <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-brand-slate-dark font-display mb-1.5 sm:mb-2">
        Order Confirmed! 🎉
      </h1>
      <p className="text-slate-500 text-xs sm:text-sm mb-5 sm:mb-8">
        Thank you for shopping with NiaKylie. Your order has been placed successfully.
      </p>

      {/* Order Details Card */}
      <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 text-left space-y-3 sm:space-y-4 shadow-sm mb-5 sm:mb-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 sm:pb-4 gap-2">
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Order ID</p>
            <p className="text-sm sm:text-lg font-extrabold text-brand-slate-dark truncate">{displayOrderId}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl flex-shrink-0">
            <span className="text-[10px] sm:text-xs font-extrabold text-emerald-700 uppercase">Confirmed</span>
          </div>
        </div>

        {/* Delivery Estimate */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
          <div className="p-1.5 sm:p-2 bg-brand-crimson/10 text-brand-crimson rounded-lg sm:rounded-xl flex-shrink-0">
            <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estimated Delivery</p>
            <p className="text-xs sm:text-sm font-extrabold text-brand-slate-dark truncate">{estimatedDelivery}</p>
          </div>
        </div>

        {/* What Happens Next Steps */}
        <div className="space-y-2 sm:space-y-3 pt-1 sm:pt-2">
          <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">What happens next</p>
          {[
            { step: '1', text: 'Order processing & quality check (24 hrs)' },
            { step: '2', text: 'Packaging & dispatch from warehouse' },
            { step: '3', text: 'Out for delivery at your doorstep' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center space-x-2.5 sm:space-x-3 text-[11px] sm:text-xs">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-brand-crimson text-white font-extrabold flex items-center justify-center flex-shrink-0 text-[9px] sm:text-[10px]">
                {step}
              </div>
              <span className="text-slate-600 truncate">{text}</span>
            </div>
          ))}
        </div>

        {/* Order Amount Summary Breakdown */}
        {orderTotal > 0 && (
          <div className="pt-2.5 sm:pt-3 border-t border-gray-100 space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs font-semibold text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{(order?.pricing?.subtotal || order?.totals?.subtotal || orderTotal).toLocaleString('en-IN')}</span>
            </div>

            {(() => {
              const cDisc = order?.pricing?.couponDiscount ?? order?.totals?.couponDiscount ?? 0;
              const oDisc = order?.pricing?.onlinePaymentDiscount ?? order?.totals?.onlinePaymentDiscount ?? 0;
              return (
                <>
                  {cDisc > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Coupon Discount</span>
                      <span>-₹{cDisc.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {oDisc > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">
                      <span>Online Payment Extra Discount</span>
                      <span>-₹{oDisc.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </>
              );
            })()}

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm font-extrabold text-brand-slate-dark">
              <span>Amount Paid</span>
              <span className="text-brand-crimson">₹{orderTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center space-y-2.5 sm:space-y-0 sm:space-x-4">
        <button
          onClick={handleDownloadReceipt}
          className="w-full sm:flex-1 flex items-center justify-center space-x-2 border-2 border-gray-300 hover:border-brand-crimson text-slate-600 hover:text-brand-crimson font-extrabold text-[11px] sm:text-xs py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all"
        >
          <Download className="w-4 h-4" />
          <span>DOWNLOAD RECEIPT</span>
        </button>

        <a
          href="/products"
          className="w-full sm:flex-1 flex items-center justify-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-[11px] sm:text-xs py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl uppercase tracking-wider group transition-all"
        >
          <Package className="w-4 h-4" />
          <span>CONTINUE SHOPPING</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  );
}

export default OrderSuccessPage;

