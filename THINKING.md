# My Thought Process

This document explains the decisions I made while building this project and why I chose certain approaches over others.

## Why a Single Dashboard Page?

I considered making separate pages for listing invoices, creating invoices, and editing invoices. But that felt clunky - you'd have to navigate back and forth constantly.

Instead, I put everything on one Dashboard page with modals for create/edit. This way:
- You can see your invoice list while adding a new one
- Updates appear immediately without page refreshes
- It just feels more like a modern app

## Why Modals Instead of Separate Routes?

For the create and edit forms, I used modals instead of navigating to `/invoices/new` or `/invoices/:id/edit`. 

Modals keep the user in context - they can still see the list behind the form. It also means less code since both create and edit use the same InvoiceForm component.

---

# If I Had to Add a Tax Amount Field

Say we needed to add `tax_amount` to invoices where `total = amount + tax_amount`. Here's how I'd do it:

## Database Changes

Add the field to the Prisma schema:

```prisma
model Invoice {
  // ... existing fields
  taxAmount Float @default(0)
}
```

Then run the migration:
```bash
npx prisma migrate dev --name add_tax_amount
```

## Backend Changes

Update the POST and PUT routes to accept `taxAmount` in the request body and include it in the Prisma create/update calls. Also update the GET route to calculate the total for display.

## Frontend Changes

Add a tax amount input to InvoiceForm.jsx and compute the total dynamically. In the table, add columns for Tax and Total.

The nice thing is the dashboard stats would automatically include tax since the backend calculates totals on the server side.

---

# Challenges I Faced

1. **CORS issues** - Took me a while to get the frontend talking to the backend. Had to configure CORS properly and set up the Vite proxy.

2. **Date handling** - JavaScript dates are annoying. Had to be careful with timezone conversions between frontend, backend, and the database.

3. **JWT storage** - I stored the token in localStorage which isn't the most secure. HttpOnly cookies would be better but require more setup with CORS credentials.
