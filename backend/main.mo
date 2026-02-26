import Map "mo:core/Map";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // ── Type definitions ──────────────────────────────────────────────────────

  public type Currency = {
    symbol : Text;
    code : Text;
    name : Text;
  };

  public type AccountType = {
    #bankAccount;
    #cash;
    #upi;
    #creditCard;
    #custom : Text;
  };

  public type Account = {
    id : Text;
    name : Text;
    accountType : AccountType;
    balance : Float;
  };

  public type TransactionType = {
    #income;
    #expense;
    #transfer;
  };

  public type Transaction = {
    id : Text;
    transactionType : TransactionType;
    accountId : Text;
    category : Text;
    amount : Float;
    timestamp : Time.Time;
    description : Text;
  };

  public type Category = {
    id : Text;
    name : Text;
    isDefault : Bool;
  };

  public type Budget = {
    id : Text;
    amount : Float;
    category : ?Text;
    isMonthly : Bool;
  };

  public type AppSettings = {
    currency : Currency;
    language : Text;
  };

  // Public-facing user profile (name + metadata only)
  public type UserProfile = {
    name : Text;
  };

  // Internal per-user data store
  type UserData = {
    accounts : Map.Map<Text, Account>;
    transactions : Map.Map<Text, Transaction>;
    categories : Map.Map<Text, Category>;
    budgets : Map.Map<Text, Budget>;
    settings : AppSettings;
    profile : UserProfile;
  };

  // ── Access-control state ──────────────────────────────────────────────────

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── Persistent state ──────────────────────────────────────────────────────

  let userData = Map.empty<Principal, UserData>();

  // ── Default data ──────────────────────────────────────────────────────────

  let defaultCurrency : Currency = {
    symbol = "₹";
    code = "INR";
    name = "Indian Rupees";
  };

  let currencies = Map.fromIter<Text, Currency>([
    ("INR", { symbol = "₹"; code = "INR"; name = "Indian Rupees" }),
    ("USD", { symbol = "$"; code = "USD"; name = "US Dollar" }),
    ("EUR", { symbol = "€"; code = "EUR"; name = "Euro" }),
    ("GBP", { symbol = "£"; code = "GBP"; name = "British Pound" }),
    ("JPY", { symbol = "¥"; code = "JPY"; name = "Japanese Yen" }),
    ("SGD", { symbol = "S$"; code = "SGD"; name = "Singapore Dollar" }),
    ("AED", { symbol = "د.إ"; code = "AED"; name = "UAE Dirham" }),
    ("BDT", { symbol = "৳"; code = "BDT"; name = "Bangladeshi Taka" }),
    ("PKR", { symbol = "₨"; code = "PKR"; name = "Pakistani Rupee" }),
    ("AUD", { symbol = "A$"; code = "AUD"; name = "Australian Dollar" }),
  ].values());

  func makeDefaultCategories() : Map.Map<Text, Category> {
    Map.fromIter<Text, Category>([
      ("default_food", { id = "default_food"; name = "Food"; isDefault = true }),
      ("default_travel", { id = "default_travel"; name = "Travel"; isDefault = true }),
      ("default_shopping", { id = "default_shopping"; name = "Shopping"; isDefault = true }),
      ("default_rent", { id = "default_rent"; name = "Rent"; isDefault = true }),
      ("default_salary", { id = "default_salary"; name = "Salary"; isDefault = true }),
      ("default_bills", { id = "default_bills"; name = "Bills"; isDefault = true }),
      ("default_emi", { id = "default_emi"; name = "EMI"; isDefault = true }),
      ("default_entertainment", { id = "default_entertainment"; name = "Entertainment"; isDefault = true }),
      ("default_health", { id = "default_health"; name = "Health"; isDefault = true }),
      ("default_other", { id = "default_other"; name = "Other"; isDefault = true }),
    ].values());
  };

  // ── Internal helpers ──────────────────────────────────────────────────────

  func getUserData(caller : Principal) : UserData {
    switch (userData.get(caller)) {
      case (?d) { d };
      case (null) {
        let d : UserData = {
          accounts = Map.empty<Text, Account>();
          transactions = Map.empty<Text, Transaction>();
          categories = makeDefaultCategories();
          budgets = Map.empty<Text, Budget>();
          settings = {
            currency = defaultCurrency;
            language = "en";
          };
          profile = { name = "" };
        };
        userData.add(caller, d);
        d;
      };
    };
  };

  func saveUserData(caller : Principal, d : UserData) {
    userData.add(caller, d);
  };

  // ── User-profile functions (required by frontend) ─────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    let d = getUserData(caller);
    ?d.profile;
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save their profile");
    };
    let d = getUserData(caller);
    saveUserData(caller, {
      accounts = d.accounts;
      transactions = d.transactions;
      categories = d.categories;
      budgets = d.budgets;
      settings = d.settings;
      profile;
    });
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    let d = getUserData(user);
    ?d.profile;
  };

  // ── Currency functions ────────────────────────────────────────────────────

  public query func getCurrencies() : async [Currency] {
    currencies.values().toArray();
  };

  // ── Account functions ─────────────────────────────────────────────────────

  public query ({ caller }) func getAccounts() : async [Account] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view accounts");
    };
    let d = getUserData(caller);
    d.accounts.values().toArray();
  };

  public shared ({ caller }) func addAccount(account : Account) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add accounts");
    };
    let d = getUserData(caller);
    let updated = d.accounts.clone();
    updated.add(account.id, account);
    saveUserData(caller, {
      accounts = updated;
      transactions = d.transactions;
      categories = d.categories;
      budgets = d.budgets;
      settings = d.settings;
      profile = d.profile;
    });
  };

  public shared ({ caller }) func deleteAccount(accountId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete accounts");
    };
    let d = getUserData(caller);
    let updated = d.accounts.clone();
    updated.remove(accountId);
    saveUserData(caller, {
      accounts = updated;
      transactions = d.transactions;
      categories = d.categories;
      budgets = d.budgets;
      settings = d.settings;
      profile = d.profile;
    });
  };

  // Transfer money between two accounts (creates a Transfer transaction)
  public shared ({ caller }) func transferMoney(
    fromAccountId : Text,
    toAccountId : Text,
    amount : Float,
    transactionId : Text,
    timestamp : Time.Time,
    description : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can transfer money");
    };
    if (amount <= 0.0) {
      Runtime.trap("Transfer amount must be positive");
    };
    let d = getUserData(caller);
    let updatedAccounts = d.accounts.clone();

    let fromAcc = switch (updatedAccounts.get(fromAccountId)) {
      case (null) { Runtime.trap("Source account not found") };
      case (?a) { a };
    };
    let toAcc = switch (updatedAccounts.get(toAccountId)) {
      case (null) { Runtime.trap("Destination account not found") };
      case (?a) { a };
    };
    if (fromAcc.balance < amount) {
      Runtime.trap("Insufficient balance in source account");
    };

    updatedAccounts.add(fromAccountId, {
      id = fromAcc.id;
      name = fromAcc.name;
      accountType = fromAcc.accountType;
      balance = fromAcc.balance - amount;
    });
    updatedAccounts.add(toAccountId, {
      id = toAcc.id;
      name = toAcc.name;
      accountType = toAcc.accountType;
      balance = toAcc.balance + amount;
    });

    let transferTx : Transaction = {
      id = transactionId;
      transactionType = #transfer;
      accountId = fromAccountId;
      category = "Transfer";
      amount;
      timestamp;
      description;
    };
    let updatedTransactions = d.transactions.clone();
    updatedTransactions.add(transactionId, transferTx);

    saveUserData(caller, {
      accounts = updatedAccounts;
      transactions = updatedTransactions;
      categories = d.categories;
      budgets = d.budgets;
      settings = d.settings;
      profile = d.profile;
    });
  };

  // ── Transaction functions ─────────────────────────────────────────────────

  public query ({ caller }) func getTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    let d = getUserData(caller);
    d.transactions.values().toArray();
  };

  public shared ({ caller }) func addTransaction(transaction : Transaction) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add transactions");
    };
    let d = getUserData(caller);
    let updatedTransactions = d.transactions.clone();
    updatedTransactions.add(transaction.id, transaction);

    // Update account balance
    let updatedAccounts = d.accounts.clone();
    switch (updatedAccounts.get(transaction.accountId)) {
      case (null) {};
      case (?acc) {
        let newBalance = switch (transaction.transactionType) {
          case (#income) { acc.balance + transaction.amount };
          case (#expense) { acc.balance - transaction.amount };
          case (#transfer) { acc.balance - transaction.amount };
        };
        updatedAccounts.add(acc.id, {
          id = acc.id;
          name = acc.name;
          accountType = acc.accountType;
          balance = newBalance;
        });
      };
    };

    saveUserData(caller, {
      accounts = updatedAccounts;
      transactions = updatedTransactions;
      categories = d.categories;
      budgets = d.budgets;
      settings = d.settings;
      profile = d.profile;
    });
  };

  public shared ({ caller }) func deleteTransaction(transactionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete transactions");
    };
    let d = getUserData(caller);
    let updatedTransactions = d.transactions.clone();

    // Reverse the balance effect before deleting
    let updatedAccounts = d.accounts.clone();
    switch (updatedTransactions.get(transactionId)) {
      case (null) {};
      case (?tx) {
        switch (updatedAccounts.get(tx.accountId)) {
          case (null) {};
          case (?acc) {
            let restoredBalance = switch (tx.transactionType) {
              case (#income) { acc.balance - tx.amount };
              case (#expense) { acc.balance + tx.amount };
              case (#transfer) { acc.balance + tx.amount };
            };
            updatedAccounts.add(acc.id, {
              id = acc.id;
              name = acc.name;
              accountType = acc.accountType;
              balance = restoredBalance;
            });
          };
        };
      };
    };

    updatedTransactions.remove(transactionId);
    saveUserData(caller, {
      accounts = updatedAccounts;
      transactions = updatedTransactions;
      categories = d.categories;
      budgets = d.budgets;
      settings = d.settings;
      profile = d.profile;
    });
  };

  // Search transactions by keyword (matches description or category)
  public query ({ caller }) func searchTransactions(keyword : Text) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search transactions");
    };
    let d = getUserData(caller);
    d.transactions.values().toArray().filter(func(tx) {
      tx.description.contains(#text keyword) or tx.category.contains(#text keyword);
    });
  };

  // Filter transactions by date range, category, and/or account
  public query ({ caller }) func filterTransactions(
    startTime : ?Time.Time,
    endTime : ?Time.Time,
    category : ?Text,
    accountId : ?Text,
    sortBy : Text,
  ) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can filter transactions");
    };
    let d = getUserData(caller);
    var txs = d.transactions.values().toArray();

    // Apply filters
    txs := txs.filter(func(tx) {
      let afterStart = switch startTime {
        case (null) { true };
        case (?s) { tx.timestamp >= s };
      };
      let beforeEnd = switch endTime {
        case (null) { true };
        case (?e) { tx.timestamp <= e };
      };
      let matchCat = switch category {
        case (null) { true };
        case (?c) { tx.category == c };
      };
      let matchAcc = switch accountId {
        case (null) { true };
        case (?a) { tx.accountId == a };
      };
      afterStart and beforeEnd and matchCat and matchAcc
    });

    // Apply sort
    txs := switch sortBy {
      case ("date_asc") {
        txs.sort(func(a, b) { Int.compare(a.timestamp, b.timestamp) });
      };
      case ("date_desc") {
        txs.sort(func(a, b) { Int.compare(b.timestamp, a.timestamp) });
      };
      case ("amount_asc") {
        txs.sort(func(a, b) { Float.compare(a.amount, b.amount) });
      };
      case ("amount_desc") {
        txs.sort(func(a, b) { Float.compare(b.amount, a.amount) });
      };
      case (_) {
        txs.sort(func(a, b) { Int.compare(b.timestamp, a.timestamp) });
      };
    };

    txs;
  };

  // ── Category functions ────────────────────────────────────────────────────

  public query ({ caller }) func getCategories() : async [Category] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view categories");
    };
    let d = getUserData(caller);
    d.categories.values().toArray();
  };

  public shared ({ caller }) func addCategory(category : Category) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add categories");
    };
    let d = getUserData(caller);
    let updated = d.categories.clone();
    updated.add(category.id, category);
    saveUserData(caller, {
      accounts = d.accounts;
      transactions = d.transactions;
      categories = updated;
      budgets = d.budgets;
      settings = d.settings;
      profile = d.profile;
    });
  };

  public shared ({ caller }) func editCategory(categoryId : Text, newName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can edit categories");
    };
    let d = getUserData(caller);
    let updated = d.categories.clone();
    switch (updated.get(categoryId)) {
      case (null) { Runtime.trap("Category not found") };
      case (?cat) {
        updated.add(categoryId, {
          id = cat.id;
          name = newName;
          isDefault = cat.isDefault;
        });
      };
    };
    saveUserData(caller, {
      accounts = d.accounts;
      transactions = d.transactions;
      categories = updated;
      budgets = d.budgets;
      settings = d.settings;
      profile = d.profile;
    });
  };

  public shared ({ caller }) func deleteCategory(categoryId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete categories");
    };
    let d = getUserData(caller);
    let updated = d.categories.clone();
    updated.remove(categoryId);
    saveUserData(caller, {
      accounts = d.accounts;
      transactions = d.transactions;
      categories = updated;
      budgets = d.budgets;
      settings = d.settings;
      profile = d.profile;
    });
  };

  // ── Budget functions ──────────────────────────────────────────────────────

  public query ({ caller }) func getBudgets() : async [Budget] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view budgets");
    };
    let d = getUserData(caller);
    d.budgets.values().toArray();
  };

  public shared ({ caller }) func addBudget(budget : Budget) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add budgets");
    };
    let d = getUserData(caller);
    let updated = d.budgets.clone();
    updated.add(budget.id, budget);
    saveUserData(caller, {
      accounts = d.accounts;
      transactions = d.transactions;
      categories = d.categories;
      budgets = updated;
      settings = d.settings;
      profile = d.profile;
    });
  };

  public shared ({ caller }) func deleteBudget(budgetId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete budgets");
    };
    let d = getUserData(caller);
    let updated = d.budgets.clone();
    updated.remove(budgetId);
    saveUserData(caller, {
      accounts = d.accounts;
      transactions = d.transactions;
      categories = d.categories;
      budgets = updated;
      settings = d.settings;
      profile = d.profile;
    });
  };

  // ── Settings functions ────────────────────────────────────────────────────

  public query ({ caller }) func getSettings() : async ?AppSettings {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view settings");
    };
    let d = getUserData(caller);
    ?d.settings;
  };

  public shared ({ caller }) func updateSettings(settings : AppSettings) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update settings");
    };
    let d = getUserData(caller);
    saveUserData(caller, {
      accounts = d.accounts;
      transactions = d.transactions;
      categories = d.categories;
      budgets = d.budgets;
      settings;
      profile = d.profile;
    });
  };
};
