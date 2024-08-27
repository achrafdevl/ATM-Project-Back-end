// ATM CHALLENGE
const data = require("./accounts.json");

const {
  emitter,
  rl,
  renderMainMenu,
  generateRandomNumber,
  persistAccounts,
  renderUserMenu,
} = require("./lib");

// load the accounts from the json file
const ACCOUNTS = data;
// the current account that is logged in
let currentAccount = null;

emitter.on("createAccount", (name) => {
  if (!name) return console.log("[ERROR] Invalid name");
  if (ACCOUNTS.find((account) => account.name === name))
    return console.log("[ERROR] Account already exists");
  const pin = generateRandomNumber(4);
  let id;
  // generate a unique id for the account (repeat if the id already exists)
  do {
    id = generateRandomNumber(8);
  } while (ACCOUNTS.find((account) => account.id === id));
  const account = {
    id,
    name,
    pin,
    balance: 0,
    transactions: [],
  };
  ACCOUNTS.push(account);
  console.log(`Account created successfully`);
  console.log(`** Your account ID is ${id}`);
  console.log(`** Your account PIN is ${pin}`);
});

emitter.on("login", async (id, pin) => {
  const account = ACCOUNTS.find((account) => account.id == id);
  if (!account) {
    console.log("[ERROR] Invalid account id");
    return;
  }
  if (account.pin != pin) {
    console.log("[ERROR] Invalid pin");
    return;
  }
  console.log("Login successful");
  currentAccount = account;
});

emitter.on("balanceCheck", () => {
  console.log(`** Your balance is ${currentAccount.balance}`);
});

emitter.on("withdraw", (amount) => {
  let d = parseInt(amount);
  if (isNaN(d)) {
    console.log("[ERROR] Invalid amount");
    return;
  }
  if (currentAccount.balance < d) {
    console.log("[ERROR] Insufficient funds");
    return;
  }
  currentAccount.balance -= d;
  currentAccount.transactions.push({
    type: "withdraw",
    amount: d,
    date: new Date().toDateString(),
  });
  console.log(`** You have withdrawn ${d}`);
  console.log(`** Your new balance is ${currentAccount.balance}`);
});

emitter.on("deposit", (amount) => {
  const d = parseInt(amount);
  if (isNaN(d)) {
    console.log("[ERROR] Invalid amount");
    return;
  }
  currentAccount.balance += d;
  currentAccount.transactions.push({
    type: "deposit",
    amount: d,
    date: new Date().toDateString(),
  });
  console.log(`** You have deposited ${d}`);
  console.log(`** Your new balance is ${currentAccount.balance}`);
});

emitter.on("history", () => {
  console.log("----------------Transaction History----------------");
  currentAccount.transactions.forEach((transaction) => {
    console.log(
      `[${transaction.date}] ${transaction.type.toUpperCase()}: ${
        transaction.amount
      }`
    );
  });
  console.log("--------------------------------------------------");
});

// This is a self-invoking async function
// It will run as soon as the file is executed
(async function atm() {
  // change the behaviour of CTRL+C (SIGINT) to persist the accounts before exiting
  rl.on("SIGINT", async () => {
    await persistAccounts(ACCOUNTS);
    console.log("Exiting...");
    rl.close();
  });

  do {
    if(currentAccount) {
      await renderUserMenu(currentAccount);
      currentAccount = null;
    }
    else {
      await renderMainMenu();
    }
  } while (true);
})();
