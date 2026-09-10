import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, ChevronLeft, ChevronRight, Mail, Phone, RefreshCw, Search, ShieldCheck, UserRound, XCircle } from 'lucide-react';
import { adminApi } from '../../api/admin';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function formatCurrency(value = 0) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

export function AdminUsersPanel() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<boolean | 'all'>('all');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const usersQuery = useQuery({
    queryKey: ['admin-users', page, limit, search, status],
    queryFn: () => adminApi.getUsers({ page, limit, search, isActive: status }),
    placeholderData: (previousData) => previousData,
    retry: 1,
  });
  const response = usersQuery.data;
  const users = response?.users || [];
  const totalPages = response?.totalPages || 1;
  const firstItem = response && response.total > 0 ? (page - 1) * limit + 1 : 0;
  const lastItem = response ? Math.min(page * limit, response.total) : 0;

  const changeLimit = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-crimson">Customer directory</p>
          <h2 className="mt-1 text-xl sm:text-2xl font-extrabold text-brand-slate-dark font-display">Users</h2>
          <p className="mt-1 text-xs text-slate-500">Search accounts, verify access, and review customer activity.</p>
        </div>
        <button onClick={() => usersQuery.refetch()} disabled={usersQuery.isFetching} className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:border-brand-crimson hover:text-brand-crimson disabled:opacity-50">
          <RefreshCw className={`h-3.5 w-3.5 ${usersQuery.isFetching ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="rounded-2xl sm:rounded-3xl border border-gray-100 bg-white p-3 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search by name or email" className="w-full rounded-xl border border-gray-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-medium text-slate-700 outline-none transition-colors focus:border-brand-crimson focus:bg-white" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(['all', true, false] as const).map((option) => (
              <button key={String(option)} onClick={() => { setStatus(option); setPage(1); }} className={`rounded-lg px-3 py-2 text-[11px] font-bold transition-colors ${status === option ? 'bg-brand-crimson text-white' : 'border border-gray-200 text-slate-500 hover:border-brand-crimson hover:text-brand-crimson'}`}>
                {option === 'all' ? 'All users' : option ? 'Active' : 'Inactive'}
              </button>
            ))}
          </div>
        </div>

        {usersQuery.isLoading ? (
          <div className="py-20 text-center text-xs font-semibold text-slate-500">Loading users...</div>
        ) : usersQuery.isError ? (
          <div className="py-20 text-center"><p className="text-xs font-semibold text-rose-500">Unable to load real users.</p><p className="mt-2 text-[11px] text-slate-500">{String((usersQuery.error as any)?.message || 'Check the backend URL and admin session, then refresh.')}</p></div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center text-xs font-semibold text-slate-500">No users match these filters.</div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="px-3 py-3 font-extrabold">User</th>
                  <th className="px-3 py-3 font-extrabold">Contact</th>
                  <th className="px-3 py-3 font-extrabold">Orders</th>
                  <th className="px-3 py-3 font-extrabold">Spent</th>
                  <th className="px-3 py-3 font-extrabold">Joined</th>
                  <th className="px-3 py-3 font-extrabold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => {
                  const isAdmin = user.roles?.some((role) => role.toUpperCase() === 'ADMIN');
                  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` || '?';
                  return (
                    <tr key={user.id} className="text-xs text-slate-600 transition-colors hover:bg-slate-50/70">
                      <td className="px-3 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 font-extrabold text-brand-crimson">{initials}</div><div><p className="font-extrabold text-brand-slate-dark">{user.firstName} {user.lastName}</p><p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">{isAdmin ? <ShieldCheck className="h-3 w-3" /> : <UserRound className="h-3 w-3" />}{isAdmin ? 'Administrator' : 'Customer'}</p></div></div></td>
                      <td className="px-3 py-4"><p className="flex items-center gap-1.5 font-semibold"><Mail className="h-3.5 w-3.5 text-slate-400" />{user.email}</p><p className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400"><Phone className="h-3 w-3" />{user.phone || 'Phone not provided'}</p></td>
                      <td className="px-3 py-4 font-bold text-brand-slate-dark">{user.orderCount ?? 0}</td>
                      <td className="px-3 py-4 font-bold text-brand-slate-dark">{formatCurrency(user.totalSpent)}</td>
                      <td className="px-3 py-4 text-[11px]">{formatDate(user.createdAt)}</td>
                      <td className="px-3 py-4"><div className="space-y-1.5"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-extrabold ${user.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{user.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}{user.isActive ? 'Active' : 'Inactive'}</span><p className={`text-[10px] font-semibold ${user.isEmailVerified ? 'text-emerald-600' : 'text-amber-600'}`}>{user.isEmailVerified ? 'Email verified' : 'Email pending'}</p></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 text-[11px] font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{response ? `Showing ${firstItem}-${lastItem} of ${response.total} users` : 'Loading users...'}</p>
          <div className="flex items-center gap-2">
            <label htmlFor="user-page-size">Rows</label>
            <select id="user-page-size" value={limit} onChange={(event) => changeLimit(Number(event.target.value))} className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-brand-crimson">
              {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
            <button aria-label="Previous page" title="Previous page" disabled={page <= 1 || usersQuery.isFetching} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-gray-200 p-2 hover:border-brand-crimson hover:text-brand-crimson disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
            <span className="min-w-16 text-center text-xs text-brand-slate-dark">Page {page} / {totalPages}</span>
            <button aria-label="Next page" title="Next page" disabled={page >= totalPages || usersQuery.isFetching} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-gray-200 p-2 hover:border-brand-crimson hover:text-brand-crimson disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminUsersPanel;
