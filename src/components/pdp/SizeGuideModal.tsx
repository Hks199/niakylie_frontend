import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SIZE_CHART = [
  { size: 'XS', bust: '32"', waist: '26"', hip: '35"', length: '42"' },
  { size: 'S', bust: '34"', waist: '28"', hip: '37"', length: '43"' },
  { size: 'M', bust: '36"', waist: '30"', hip: '39"', length: '44"' },
  { size: 'L', bust: '38"', waist: '32"', hip: '41"', length: '45"' },
  { size: 'XL', bust: '40"', waist: '34"', hip: '43"', length: '46"' },
  { size: 'XXL', bust: '42"', waist: '36"', hip: '45"', length: '47"' },
];

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-50 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Ruler className="w-5 h-5 text-brand-crimson" />
              <h3 className="font-extrabold text-lg text-brand-slate-dark">Garment Size Chart</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-brand-slate-dark">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Size Chart Table */}
          <div className="my-6 overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-white font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Bust</th>
                  <th className="py-3 px-4">Waist</th>
                  <th className="py-3 px-4">Hip</th>
                  <th className="py-3 px-4">Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-slate-700">
                {SIZE_CHART.map((row) => (
                  <tr key={row.size} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-extrabold text-brand-crimson">{row.size}</td>
                    <td className="py-3 px-4">{row.bust}</td>
                    <td className="py-3 px-4">{row.waist}</td>
                    <td className="py-3 px-4">{row.hip}</td>
                    <td className="py-3 px-4">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-500 space-y-1">
            <p className="font-bold text-slate-700">How to Measure:</p>
            <p>• <strong>Bust:</strong> Measure around the fullest part of your chest.</p>
            <p>• <strong>Waist:</strong> Measure around your natural waistline.</p>
            <p>• <strong>Hips:</strong> Measure around the widest point of your hips.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SizeGuideModal;
