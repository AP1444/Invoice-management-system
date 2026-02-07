import { useState, useEffect } from 'react';
import api from '../api/axios';

function InvoiceForm({ invoice, onClose, onSave }) {
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerName: '',
    amount: '',
    invoiceDate: '',
    status: 'Unpaid'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const isEditing = !!invoice;

  useEffect(() => {
    if (invoice) {
      setFormData({
        invoiceNumber: invoice.invoiceNumber || '',
        customerName: invoice.customerName || '',
        amount: invoice.amount?.toString() || '',
        invoiceDate: invoice.invoiceDate ? invoice.invoiceDate.split('T')[0] : '',
        status: invoice.status || 'Unpaid'
      });
    }
  }, [invoice]);

  const validate = () => {
    const newErrors = {};

    if (!formData.invoiceNumber.trim()) {
      newErrors.invoiceNumber = 'Invoice number is required';
    }
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer/Vendor name is required';
    }
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) < 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (!formData.invoiceDate) {
      newErrors.invoiceDate = 'Invoice date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const data = { ...formData, amount: parseFloat(formData.amount) };

      if (isEditing) {
        await api.put(`/invoices/${invoice.id}`, data);
      } else {
        await api.post('/invoices', data);
      }

      onSave();
    } catch (error) {
      setApiError(error.response?.data?.error || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? 'Edit Invoice' : 'Create Invoice'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {apiError && <div className="login-error">{apiError}</div>}

            <div className="form-group">
              <label className="form-label">Invoice Number *</label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., INV-001"
                disabled={isEditing}
                style={isEditing ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed' } : {}}
              />
              {errors.invoiceNumber && <p className="form-error">{errors.invoiceNumber}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Customer/Vendor Name *</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Acme Corporation"
              />
              {errors.customerName && <p className="form-error">{errors.customerName}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Amount *</label>
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
              {errors.amount && <p className="form-error">{errors.amount}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Invoice Date *</label>
              <input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleChange}
                className="form-input"
              />
              {errors.invoiceDate && <p className="form-error">{errors.invoiceDate}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
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

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InvoiceForm;
