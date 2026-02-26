# Specification

## Summary
**Goal:** Fix four broken interactions in the ExpenseX frontend: account selection in the Add Transaction modal, the Add button submission, the From/To dropdowns in the Transfer Money modal, and the Transfer action on the Accounts page.

**Planned changes:**
- Fix the account selector dropdown in `AddTransactionModal.tsx` so it is properly bound to React state and reflects the selected value
- Fix the Add/Submit button in `AddTransactionModal.tsx` so it triggers form validation and calls the add transaction mutation correctly
- Fix the From and To account selector dropdowns in `TransferMoneyModal.tsx` so both are independently bound to state and pass correct account IDs on submit
- Fix the Transfer button on the Accounts page (`AccountsPage.tsx`) so it opens `TransferMoneyModal` correctly and allows the user to complete a transfer

**User-visible outcome:** Users can select accounts in the Add Transaction modal and successfully submit transactions, and can select From/To accounts in the Transfer modal and complete transfers from the Accounts page.
