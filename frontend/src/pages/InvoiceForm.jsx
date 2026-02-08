import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';

function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerName: '',
    amount: '',
    invoiceDate: '',
    status: 'Unpaid'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (isEditing) {
      fetchInvoice();
    }
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const response = await api.get(`/invoices/${id}`);
      const invoice = response.data;
      setFormData({
        invoiceNumber: invoice.invoiceNumber || '',
        customerName: invoice.customerName || '',
        amount: invoice.amount?.toString() || '',
        invoiceDate: invoice.invoiceDate ? invoice.invoiceDate.split('T')[0] : '',
        status: invoice.status || 'Unpaid'
      });
    } catch (error) {
      setApiError('Failed to load invoice');
    } finally {
      setFetching(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.invoiceNumber.trim()) newErrors.invoiceNumber = 'Invoice number is required';
    if (!formData.customerName.trim()) newErrors.customerName = 'Customer/Vendor name is required';
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) < 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (!formData.invoiceDate) newErrors.invoiceDate = 'Invoice date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const data = { ...formData, amount: parseFloat(formData.amount) };
      if (isEditing) {
        await api.put(`/invoices/${id}`, data);
      } else {
        await api.post('/invoices', data);
      }
      navigate('/invoices');
    } catch (error) {
      setApiError(error.response?.data?.error || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
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
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{isEditing ? 'Edit Invoice' : 'Create Invoice'}</h1>
        <p className="text-slate-500">{isEditing ? 'Update invoice details' : 'Fill in the details to create a new invoice'}</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            {apiError && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-center text-sm">{apiError}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Invoice Number *</label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                className={`form-input ${isEditing ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                placeholder="e.g., INV-001"
                disabled={isEditing}
              />
              {errors.invoiceNumber && <p className="text-red-500 text-xs mt-1">{errors.invoiceNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Customer/Vendor Name *</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Acme Corporation"
              />
              {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="form-input"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Invoice Date *</label>
              <input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleChange}
                className="form-input"
              />
              {errors.invoiceDate && <p className="text-red-500 text-xs mt-1">{errors.invoiceDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-input form-select"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/invoices')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update Invoice' : 'Create Invoice')}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default InvoiceForm;
