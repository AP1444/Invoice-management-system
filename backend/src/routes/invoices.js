import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

// Get all invoices with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, startDate, endDate, search } = req.query;
    const where = {};

    if (status && (status === 'Paid' || status === 'Unpaid')) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.invoiceDate = {};
      if (startDate) where.invoiceDate.gte = new Date(startDate);
      if (endDate) where.invoiceDate.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customerName: { contains: search } }
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    const allInvoices = await prisma.invoice.findMany();
    const totalInvoices = allInvoices.length;
    const totalAmount = allInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    res.json({
      invoices,
      stats: { totalInvoices, totalAmount, filteredCount: invoices.length }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { invoiceNumber, customerName, amount, invoiceDate, status } = req.body;

    if (!invoiceNumber || !customerName || amount === undefined || !invoiceDate) {
      return res.status(400).json({
        error: 'Invoice number, customer name, amount, and date are required'
      });
    }

    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const validStatus = status === 'Paid' || status === 'Unpaid' ? status : 'Unpaid';

    const existing = await prisma.invoice.findUnique({ where: { invoiceNumber } });
    if (existing) {
      return res.status(400).json({ error: 'Invoice number already exists' });
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerName,
        amount: parseFloat(amount),
        invoiceDate: new Date(invoiceDate),
        status: validStatus
      }
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { invoiceNumber, customerName, amount, invoiceDate, status } = req.body;

    const existing = await prisma.invoice.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (invoiceNumber && invoiceNumber !== existing.invoiceNumber) {
      const conflict = await prisma.invoice.findUnique({
        where: { invoiceNumber }
      });
      if (conflict) {
        return res.status(400).json({ error: 'Invoice number already exists' });
      }
    }

    const updateData = {};
    if (invoiceNumber) updateData.invoiceNumber = invoiceNumber;
    if (customerName) updateData.customerName = customerName;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (invoiceDate) updateData.invoiceDate = new Date(invoiceDate);
    if (status && (status === 'Paid' || status === 'Unpaid')) {
      updateData.status = status;
    }

    const invoice = await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(invoice);
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.invoice.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    await prisma.invoice.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

export default router;
