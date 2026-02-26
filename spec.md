# Specification

## Summary
**Goal:** Build ExpenseX, a full-stack personal finance app on the Internet Computer with Internet Identity authentication, multi-account management, transaction tracking, budgeting, analytics, and settings.

**Planned changes:**
- Internet Identity login screen; unauthenticated users cannot access app data; each user's data is scoped to their principal in the Motoko backend
- Multi-account management: support Cash, Bank Account, UPI, Credit Card, and Custom account types; add/delete accounts; view running balances; transfer money between accounts
- Transactions/Records system: add and delete Income, Expense, and Transfer transactions (with account, category, amount, date/time); search by keyword; filter by date range, category, and account; sort by amount or date ascending/descending; account balances update on add/delete
- Category management: 10 pre-populated default categories (Food, Travel, Shopping, Rent, Salary, Bills, EMI, Entertainment, Health, Other); add custom categories; edit and delete categories
- Budget management: set overall monthly budget and per-category monthly budgets; display remaining amount and progress bar with percentage used; amber warning at 80% usage; red alert when exceeded
- Analysis & Reports screen: dashboard totals (Total Balance, Total Income, Total Expense); monthly income vs expense bar chart; category-wise expense pie chart; spending trend line graph; weekly/monthly/yearly filter; client-side PDF download of filtered transactions
- Settings screen: currency selector (default ₹ INR) that updates symbol app-wide; English/Hindi language toggle; preferences persist across sessions
- Bottom navigation bar with five tabs: Home, Records, center "+" FAB (opens Add Transaction modal), Analysis, Accounts; works on mobile and desktop
- Green and teal/blue color palette; dark mode toggle with persistent preference; smooth fade/slide transitions on page and modal changes; mobile-first responsive layout (375px+)
- All data stored on-chain in a single Motoko actor; no external APIs or databases

**User-visible outcome:** Users can log in with Internet Identity, manage multiple accounts and categories, record and search transactions, set and monitor budgets, view charts and download a PDF report, switch currency and language, and navigate the full app via a bottom nav bar — all with a clean, dark-mode-capable finance UI.
