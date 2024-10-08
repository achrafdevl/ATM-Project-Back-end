const fs = require("fs");
const readlineSync = require("readline-sync");
const EventEmitter = require("events");

const eventEmitter = new EventEmitter();

//! Load users from users.json
const usersFile = "users.json";
let users = [];
if (fs.existsSync(usersFile)) {
  const data = fs.readFileSync(usersFile, "utf8");
  users = JSON.parse(data);
}

//! Load transactions from transactions.json
const transactionsFile = "transactions.json";
let transactions = [];
if (fs.existsSync(transactionsFile)) {
  const data = fs.readFileSync(transactionsFile, "utf8");
  transactions = JSON.parse(data);
}

//! Helper function to save data to files
const saveData = () => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), "utf8");
  fs.writeFileSync(
    transactionsFile,
    JSON.stringify(transactions, null, 2),
    "utf8"
  );
};

//! Event listeners for different ATM operations
eventEmitter.on("deposit", (user, amount) => {
  user.balance += amount;
  user.transactions.push({
    type: "deposit",
    amount,
    date: new Date().toISOString().split("T")[0],
  });
  transactions.push({
    accountID: user.accountID,
    type: "deposit",
    amount,
    date: new Date().toISOString(),
  });
  saveData();
});

eventEmitter.on("withdraw", (user, amount) => {
  if (user.balance >= amount) {
    user.balance -= amount;
    user.transactions.push({
      type: "withdraw",
      amount,
      date: new Date().toISOString().split("T")[0],
    });
    transactions.push({
      accountID: user.accountID,
      type: "withdraw",
      amount,
      date: new Date().toISOString(),
    });
    saveData();
  } else {
    console.log("Insufficient funds!");
  }
});

eventEmitter.on("addUser", (user) => {
  saveData();
});

const authenticateUser = () => {
  const accountID = readlineSync.question("Enter your accountID: ");
  const pin = readlineSync.question("Enter your pin: ", { hideEchoBack: true });

  const user = users.find((u) => u.accountID === accountID && u.pin === pin);

  if (user) {
    console.log("Authentication successful!");
    return user;
  } else {
    console.log("Invalid credentials. Please try again.");
    return null;
  }
};


//! Checking Balance
const checkBalance = (user) => {
  console.log(`Your current balance is: $${user.balance}`);
  
};


//! Deposit Money
const depositMoney = (user) => {
  const amount = parseFloat(
    readlineSync.question("Enter the deposit amount: ")
  );
  eventEmitter.emit("deposit", user, amount);
  console.log(`Deposit successful! New balance: $${user.balance}`);
};


//! Withdraw Money
const withdrawMoney = (user) => {
  const amount = parseFloat(
    readlineSync.question("Enter the withdrawal amount: ")
  );
  eventEmitter.emit("withdraw", user, amount);
  console.log(`Withdrawal successful! New balance: $${user.balance}`);
};

//! Viewing Transaction History
const viewTransactionHistory = (user) => {
  console.log("Transaction History:");
  user.transactions.forEach((transaction) => {
    console.log(
      `${transaction.type} - $${transaction.amount} - ${transaction.date}`
    );
  });
};

//! Adding a new User
const addUser = () => {
  const name = readlineSync.question("Enter your name: ");
  const pin = readlineSync.question("Set your pin (4 digits): ", {
    hideEchoBack: true,
  });

  const accountID = `ACC${users.length + 1}`; //? Generate a new unique accountID
  const newUser = {
    accountID,
    name,
    pin,
    balance: 0.0,
    transactions: [],
  };

  users.push(newUser);
  eventEmitter.emit("addUser", newUser);
  console.log("User added successfully!");
};


//! Main program flow
const main = () => {
  while (true) {
    console.log("\n================ Welcome To CASH BANK ================");
    console.log("\nOptions:");
    console.log("1. Login to your Account");
    console.log("2. Add User");
    console.log("3. Exit");

    const choice = parseInt(readlineSync.question("Enter your choice: "), 10);

    switch (choice) {
      case 1:
        const user = authenticateUser();
        if (user) {
          performUserOperations(user);
        }
        break;
      case 2:
        addUser();
        break;
      case 3:
        console.log("Exiting...");
        return;
      default:
        console.log("Invalid choice. Please try again.");
    }
  }
};


const performUserOperations = (user) => {
  while (true) {
    console.log("\nOptions:");
    console.log("1. Check Balance");
    console.log("2. Deposit Money");
    console.log("3. Withdraw Money");
    console.log("4. View Transaction History");
    console.log("5. Exit");

    const choice = parseInt(readlineSync.question("Enter your choice: "), 10);

    switch (choice) {
      case 1:
        checkBalance(user);
        break;
      case 2:
        depositMoney(user);
        break;
      case 3:
        withdrawMoney(user);
        break;
      case 4:
        viewTransactionHistory(user);
        break;
      case 5:
        console.log("Exiting...");
        return;
      default:
        console.log("Invalid choice. Please try again.");
    }
  }
};


main();