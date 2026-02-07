import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import InvoiceForm from '../components/InvoiceForm';

function Dashboard() {
  const { user, logout } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({ totalInvoices: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', startDate: '', endDate: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
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
      setStats(response.data.stats);
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

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
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

  const handleFormClose = () => {
    setShowForm(false);
    setEditingInvoice(null);
  };

  const handleFormSave = () => {
    handleFormClose();
    fetchInvoices();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const hasFilters = filters.search || filters.status || filters.startDate || filters.endDate;

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <Link to="/dashboard" className="navbar-brand">Invoice Manager</Link>
          <div className="navbar-user">
            <span>Welcome, {user?.name || user?.email}</span>
            <button className="btn btn-secondary btn-sm" onClick={logout}>Logout</button>
          </div>
        </div>
      </nav>

      <main className="container">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Manage and track your invoices</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card primary">
            <p className="stat-label">Total Invoices</p>
            <p className="stat-value">{stats.totalInvoices}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Amount</p>
            <p className="stat-value">{formatCurrency(stats.totalAmount)}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Filtered Results</p>
            <p className="stat-value">{invoices.length}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Invoices</h2>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ New Invoice</button>
          </div>

          <div className="card-body">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                name="search"
                placeholder="Search..."
                value={filters.search}
                onChange={handleFilterChange}
                className="form-input"
                style={{ flex: '1', minWidth: '150px', padding: '8px 12px' }}
              />
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="form-input form-select"
                style={{ width: '120px', padding: '8px 12px' }}
              >
                <option value="">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
              <div style={{ position: 'relative', width: '130px' }}>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="form-input"
                  style={{ width: '100%', padding: '8px 12px', color: filters.startDate ? 'inherit' : 'transparent' }}
                />
                {!filters.startDate && (
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', fontSize: '0.9375rem' }}>Start Date</span>
                )}
              </div>
              <div style={{ position: 'relative', width: '130px' }}>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="form-input"
                  style={{ width: '100%', padding: '8px 12px', color: filters.endDate ? 'inherit' : 'transparent' }}
                />
                {!filters.endDate && (
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', fontSize: '0.9375rem' }}>End Date</span>
                )}
              </div>
              {hasFilters && (
                <button className="btn btn-secondary btn-sm" onClick={clearFilters} style={{ whiteSpace: 'nowrap' }}>Clear</button>
              )}
            </div>

            {loading ? (
              <div className="loading"><div className="spinner"></div></div>
            ) : invoices.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <p className="empty-state-text">No invoices found</p>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>Create your first invoice</button>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Customer/Vendor</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td><strong>{invoice.invoiceNumber}</strong></td>
                        <td>{invoice.customerName}</td>
                        <td>{formatCurrency(invoice.amount)}</td>
                        <td>{formatDate(invoice.invoiceDate)}</td>
                        <td><span className={`badge badge-${invoice.status.toLowerCase()}`}>{invoice.status}</span></td>
                        <td>
                          <div className="actions">
                            <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(invoice)}>Edit</button>
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
      </main>

      {showForm && <InvoiceForm invoice={editingInvoice} onClose={handleFormClose} onSave={handleFormSave} />}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Confirm Delete</h2>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this invoice? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
