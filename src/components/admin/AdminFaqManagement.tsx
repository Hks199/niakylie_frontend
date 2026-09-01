import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  HelpCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  X,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { cmsApi, FaqItem } from '../../api/cms';

const CATEGORIES = ['All', 'General', 'Orders', 'Shipping', 'Returns', 'Payments'] as const;

export function AdminFaqManagement() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    question: string;
    answer: string;
    category: string;
    displayOrder: number;
    isActive: boolean;
  }>({
    question: '',
    answer: '',
    category: 'General',
    displayOrder: 1,
    isActive: true,
  });

  // Fetch admin FAQs
  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: () => cmsApi.getAdminFaqs(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (dto: Partial<FaqItem>) => cmsApi.createFaq(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<FaqItem> }) => cmsApi.updateFaq(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsApi.deleteFaq(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      setDeletingId(null);
    },
  });

  // Filtered FAQs
  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'All' || faq.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openAddModal = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: 'General',
      displayOrder: faqs.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (faq: FaqItem) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'General',
      displayOrder: faq.displayOrder ?? 1,
      isActive: faq.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFaq(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) return;

    if (editingFaq) {
      const id = editingFaq.id || editingFaq._id;
      if (id) {
        updateMutation.mutate({ id, dto: formData });
      }
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleToggleStatus = (faq: FaqItem) => {
    const id = faq.id || faq._id;
    if (!id) return;
    updateMutation.mutate({
      id,
      dto: { isActive: !(faq.isActive !== false) },
    });
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-4 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-brand-crimson/10 text-brand-crimson rounded-2xl">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-brand-slate-dark font-display">
              FAQ Content Management
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Add, edit, reorder, or publish customer service FAQs rendered across the storefront
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md transition-all uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span>Add New FAQ</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-700 outline-none focus:border-brand-crimson"
          />
        </div>
      </div>

      {/* FAQs List Table/Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-crimson" />
          <p className="text-xs font-semibold text-slate-400">Loading FAQ records...</p>
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-50/50 border border-dashed border-gray-200 rounded-3xl space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-brand-slate-dark font-display">No FAQs found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'All'
              ? 'Try adjusting your search query or selected category filter.'
              : 'Click "Add New FAQ" to create your first published help question.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const faqId = faq.id || faq._id || '';
            const isActive = faq.isActive !== false;

            return (
              <div
                key={faqId}
                className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isActive ? 'bg-white border-gray-100 hover:border-gray-200 shadow-sm' : 'bg-slate-50/60 border-slate-200 opacity-75'
                }`}
              >
                {/* Content info */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 text-brand-crimson text-[10px] font-extrabold uppercase tracking-wider border border-rose-100">
                      {faq.category}
                    </span>
                    
                    <span className="text-[10px] font-extrabold text-slate-400 flex items-center space-x-1">
                      <ArrowUpDown className="w-3 h-3" />
                      <span>Order: #{faq.displayOrder ?? 1}</span>
                    </span>

                    <span
                      className={`inline-flex items-center space-x-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{isActive ? 'Published' : 'Draft / Hidden'}</span>
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-brand-slate-dark font-display leading-snug">
                    {faq.question}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 self-end md:self-center flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button
                    onClick={() => handleToggleStatus(faq)}
                    title={isActive ? 'Hide FAQ' : 'Publish FAQ'}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {isActive ? 'Hide' : 'Publish'}
                  </button>

                  <button
                    onClick={() => openEditModal(faq)}
                    className="p-2 rounded-xl border border-gray-200 text-slate-600 hover:text-brand-crimson hover:border-brand-crimson transition-colors"
                    title="Edit FAQ"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeletingId(faqId)}
                    className="p-2 rounded-xl border border-gray-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition-colors"
                    title="Delete FAQ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg sm:text-xl font-extrabold text-brand-slate-dark font-display">
                {editingFaq ? 'Edit FAQ Article' : 'Add New FAQ Article'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Question */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g. What is the return window for saree orders?"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-brand-crimson"
                />
              </div>

              {/* Answer */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  Answer *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Detailed answer explanation..."
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs font-medium text-slate-800 outline-none focus:border-brand-crimson leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-brand-crimson"
                  >
                    <option value="General">General</option>
                    <option value="Orders">Orders</option>
                    <option value="Shipping">Shipping</option>
                    <option value="Returns">Returns</option>
                    <option value="Payments">Payments</option>
                  </select>
                </div>

                {/* Display Order */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-brand-crimson"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-gray-200/60">
                <div>
                  <p className="text-xs font-bold text-slate-800">Publish Immediately</p>
                  <p className="text-[10px] text-slate-400">Published FAQs will immediately show on /faqs page</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 accent-brand-crimson rounded cursor-pointer"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex items-center space-x-2 bg-brand-crimson hover:bg-brand-crimson-dark text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all uppercase tracking-wider disabled:opacity-50"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>{editingFaq ? 'Save Changes' : 'Create FAQ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-brand-slate-dark font-display">Delete FAQ Entry</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete this FAQ entry? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingId)}
                disabled={deleteMutation.isPending}
                className="flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-5 py-2 rounded-xl shadow-md transition-all uppercase tracking-wider disabled:opacity-50"
              >
                {deleteMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminFaqManagement;
