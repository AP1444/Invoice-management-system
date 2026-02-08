import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', startDate: '', endDate: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchInvoices = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/invoices?${params.toString()}`);
      setInvoices(response.data.invoices);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', status: '', startDate: '', endDate: '' });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/invoices/${id}`);
      setDeleteConfirm(null);
      fetchInvoices();
    } catch (error) {
      console.error('Failed to delete invoice:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const hasFilters = filters.search || filters.status || filters.startDate || filters.endDate;

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Invoices</h1>
        <p className="text-slate-500">Manage and track all your invoices</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">All Invoices</h2>
          <Link to="/invoices/new" className="btn btn-primary">+ New Invoice</Link>
        </div>

        <div className="p-5">
          <div className="flex gap-2 mb-4 items-center flex-wrap">
            <input
              type="text"
              name="search"
              placeholder="Search..."
              value={filters.search}
              onChange={handleFilterChange}
              className="form-input flex-1 min-w-[150px]"
            />
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="form-input form-select w-32"
            >
              <option value="">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
            <div className="relative w-32">
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="form-input w-full"
                style={{ color: filters.startDate ? 'inherit' : 'transparent' }}
              />
              {!filters.startDate && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">Start Date</span>
              )}
            </div>
            <div className="relative w-32">
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="form-input w-full"
                style={{ color: filters.endDate ? 'inherit' : 'transparent' }}
              />
              {!filters.endDate && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">End Date</span>
              )}
            </div>
            {hasFilters && (
              <button className="btn btn-secondary btn-sm whitespace-nowrap" onClick={clearFilters}>Clear</button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner"></div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <div className="text-5xl mb-4">📭</div>
              <p className="mb-4">No invoices found</p>
              <Link to="/invoices/new" className="btn btn-primary">Create your first invoice</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border-b border-slate-200">Invoice #</th>
                    <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border-b border-slate-200">Customer/Vendor</th>
                    <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border-b border-slate-200">Amount</th>
                    <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border-b border-slate-200">Date</th>
                    <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border-b border-slate-200">Status</th>
                    <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border-b border-slate-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50">
                      <td className="p-4 border-b border-slate-200"><strong>{invoice.invoiceNumber}</strong></td>
                      <td className="p-4 border-b border-slate-200">{invoice.customerName}</td>
                      <td className="p-4 border-b border-slate-200">{formatCurrency(invoice.amount)}</td>
                      <td className="p-4 border-b border-slate-200">{formatDate(invoice.invoiceDate)}</td>
                      <td className="p-4 border-b border-slate-200">
                        <span className={`badge badge-${invoice.status.toLowerCase()}`}>{invoice.status}</span>
                      </td>
                      <td className="p-4 border-b border-slate-200">
                        <div className="flex gap-2">
                          <Link to={`/invoices/${invoice.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(invoice.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Confirm Delete</h2>
              <button className="text-2xl text-slate-400 hover:text-slate-600 leading-none" onClick={() => setDeleteConfirm(null)}>&times;</button>
            </div>
            <div className="p-5">
              <p>Are you sure you want to delete this invoice? This action cannot be undone.</p>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Invoices;
