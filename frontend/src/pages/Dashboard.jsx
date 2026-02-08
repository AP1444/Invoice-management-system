import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';

function Dashboard() {
  const [stats, setStats] = useState({ totalInvoices: 0, totalAmount: 0, paidCount: 0, unpaidCount: 0 });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/invoices');
      setStats(response.data.stats);
      setRecentInvoices(response.data.invoices.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Dashboard</h1>
        <p className="text-slate-500">Overview of your invoice management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-6 shadow-sm">
          <p className="text-white/80 text-sm mb-2">Total Invoices</p>
          <p className="text-white text-3xl font-bold">{stats.totalInvoices}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm mb-2">Total Amount</p>
          <p className="text-slate-800 text-3xl font-bold">{formatCurrency(stats.totalAmount)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm mb-2">Quick Actions</p>
          <div className="flex gap-2 mt-2">
            <Link to="/invoices/new" className="btn btn-primary btn-sm">+ New Invoice</Link>
            <Link to="/invoices" className="btn btn-secondary btn-sm">View All</Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">Recent Invoices</h2>
          <Link to="/invoices" className="text-indigo-500 text-sm font-medium hover:text-indigo-600">View all →</Link>
        </div>
        <div className="p-5">
          {recentInvoices.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <div className="text-4xl mb-3">📭</div>
              <p className="mb-4">No invoices yet</p>
              <Link to="/invoices/new" className="btn btn-primary">Create your first invoice</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border-b border-slate-200">Invoice #</th>
                    <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border-b border-slate-200">Customer</th>
                    <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border-b border-slate-200">Amount</th>
                    <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border-b border-slate-200">Date</th>
                    <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border-b border-slate-200">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50">
                      <td className="p-4 border-b border-slate-200">
                        <Link to={`/invoices/${invoice.id}/edit`} className="font-medium text-indigo-500 hover:text-indigo-600">{invoice.invoiceNumber}</Link>
                      </td>
                      <td className="p-4 border-b border-slate-200">{invoice.customerName}</td>
                      <td className="p-4 border-b border-slate-200">{formatCurrency(invoice.amount)}</td>
                      <td className="p-4 border-b border-slate-200">{formatDate(invoice.invoiceDate)}</td>
                      <td className="p-4 border-b border-slate-200">
                        <span className={`badge badge-${invoice.status.toLowerCase()}`}>{invoice.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
