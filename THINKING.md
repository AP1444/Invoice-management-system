# My Thought Process

## Why Separate Pages Instead of a Single Dashboard?

I restructured the app from a single Dashboard page to multiple dedicated pages:

| Page | Purpose |
|------|---------|
| Dashboard | Quick stats overview and recent invoices |
| Invoices | Full list with advanced filtering |
| Invoice Form | Dedicated create/edit experience |

This separation gives each page a clear purpose and makes the app more navigable. The Dashboard provides a quick summary, while the Invoices page handles detailed management tasks.

## Why Full Pages Instead of Modals?

For create and edit forms, I switched from modals to dedicated routes (`/invoices/new`, `/invoices/:id/edit`). This approach:
- Works better on mobile devices
- Allows users to bookmark or share specific actions
- Gives more space for the form without feeling cramped
- Makes the back button work naturally

## Why Tailwind CSS?

I migrated from vanilla CSS to Tailwind because:
- **Faster development** - Utility classes let me style without context switching
- **Consistency** - Built-in design system with sensible defaults
- **Smaller bundle** - Only used utilities are included in production
- **Easier maintenance** - Styles live next to components, not in separate files

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
