import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Transaction {
    id: string;
    transactionType: TransactionType;
    accountId: string;
    description: string;
    timestamp: Time;
    category: string;
    amount: number;
}
export interface Budget {
    id: string;
    category?: string;
    isMonthly: boolean;
    amount: number;
}
export interface AppSettings {
    language: string;
    currency: Currency;
}
export type Time = bigint;
export type AccountType = {
    __kind__: "upi";
    upi: null;
} | {
    __kind__: "creditCard";
    creditCard: null;
} | {
    __kind__: "bankAccount";
    bankAccount: null;
} | {
    __kind__: "custom";
    custom: string;
} | {
    __kind__: "cash";
    cash: null;
};
export interface Account {
    id: string;
    balance: number;
    name: string;
    accountType: AccountType;
}
export interface Currency {
    code: string;
    name: string;
    symbol: string;
}
export interface Category {
    id: string;
    name: string;
    isDefault: boolean;
}
export interface UserProfile {
    name: string;
}
export enum TransactionType {
    expense = "expense",
    income = "income",
    transfer = "transfer"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAccount(account: Account): Promise<void>;
    addBudget(budget: Budget): Promise<void>;
    addCategory(category: Category): Promise<void>;
    addTransaction(transaction: Transaction): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteAccount(accountId: string): Promise<void>;
    deleteBudget(budgetId: string): Promise<void>;
    deleteCategory(categoryId: string): Promise<void>;
    deleteTransaction(transactionId: string): Promise<void>;
    editCategory(categoryId: string, newName: string): Promise<void>;
    filterTransactions(startTime: Time | null, endTime: Time | null, category: string | null, accountId: string | null, sortBy: string): Promise<Array<Transaction>>;
    getAccounts(): Promise<Array<Account>>;
    getBudgets(): Promise<Array<Budget>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(): Promise<Array<Category>>;
    getCurrencies(): Promise<Array<Currency>>;
    getSettings(): Promise<AppSettings | null>;
    getTransactions(): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchTransactions(keyword: string): Promise<Array<Transaction>>;
    transferMoney(fromAccountId: string, toAccountId: string, amount: number, transactionId: string, timestamp: Time, description: string): Promise<void>;
    updateSettings(settings: AppSettings): Promise<void>;
}
