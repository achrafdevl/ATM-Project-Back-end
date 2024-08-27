const fs = require("fs");
const events = require("events");
const emitter = new events.EventEmitter();

//! Load user data from file
const loadUserData = () => {
  const data = fs.readFileSync("users.json", "utf8");
  return JSON.parse(data);
};

//! Function to consist 4 digits of Pin
function generatePIN() {
  let pin = prompt("Please enter a 4-digit PIN:");

  if (pin.length !== 4 || isNaN(pin)) {
    console.log("The PIN must consist of 4 digits.");

    return generatePIN();
  } else {
    return pin;
  }
}

let nextUserID = 1002;

function generateUserID() {
  nextUserID++;
  return "ACC" + nextUserID;
}

//! Function to add a new user to the system
function addUser(users, name) {
  const newUserID = generateUserID();
  const newPIN = generatePIN();

  const newUser = {
    accountID: newUserID,
    name: name,
    pin: newPIN.toString(),
    balance: 0.0,
    transactions: [],
  };

  users.push(newUser);
  return newUser;
}

//! Save user data to file
const saveUserData = (users) => {
  const data = JSON.stringify(users, null, 2);
  fs.writeFileSync("users.json", data);
};

//! Authenticate user
const authenticateUser = (accountID, pin) => {
  const users = loadUserData();
  const user = users.find((u) => u.accountID === accountID && u.pin === pin);
  return user;
};

//! Event listeners
emitter.on("checkBalance", (user) => {
  console.log(`Your current balance is $ ${user.balance}`);
});

emitter.on("deposit", (user, amount) => {
  if (isNaN(amount) || amount <= 0) {
    console.log("Invalid amount.");
    return;
  }

  user.balance += amount;
  user.transactions.push({ type: "deposit", amount, date: new Date() });
  saveUserData(loadUserData());
  console.log(`$${amount} deposited successfully.`);
});

emitter.on("withdraw", (user, amount) => {
  if (isNaN(amount) || amount <= 0) {
    console.log("Invalid amount.");
    return;
  }

  if (user.balance < amount) {
    console.log("Insufficient funds.");
    return;
  }

  // Implement withdrawal limit logic here

  user.balance -= amount;
  user.transactions.push({ type: "withdrawal", amount, date: new Date() });
  saveUserData(loadUserData());
  console.log(`$${amount} withdrawn successfully.`);
});

emitter.on("viewTransactions", (user) => {
  console.log("Transaction History:");
  user.transactions.forEach((transaction) => {
    console.log(
      `${transaction.date.toLocaleString()} - ${transaction.type}: $${
        transaction.amount
      }`
    );
  });
});

// Perform ATM operations
const performOperation = (operation, user, amount) => {
  const users = loadUserData();

  if (!user) {
    console.log("Invalid accountID or pin.");
    return;
  }

  switch (operation) {
    case "checkBalance":
      emitter.emit("checkBalance", user);
      break;
    case "deposit":
      emitter.emit("deposit", user, amount);
      break;
    case "withdraw":
      emitter.emit("withdraw", user, amount);
      break;
    case "viewTransactions":
      emitter.emit("viewTransactions", user);
      break;
    default:
      console.log("Invalid operation.");
  }

  saveUserData(users);
};

// Command-line interface
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const main = async () => {
  console.clear();
  console.log("Welcome to the ATM management system.");
  console.log("Choose an operation:");
  console.log("1. Sign in");
  console.log("2. Sign up");

  const choice = await prompt("Choose an option: ");

  switch (choice) {
    case "1":
      const accountID = await prompt("Enter your account ID: \n");

      const pin = await prompt("Enter your pin: ");

      const user = authenticateUser(accountID, pin);

 

      if (!user) {
        console.log("Login failed. Please try again.");
        main();

        break;
        // return;
      }

      console.log(`Welcome, ${user.name}.`);

      // while (true) {
        const operation = await prompt(
          "Choose an operation (checkBalance, deposit, withdraw, viewTransactions, exit): "
        );

        console.log(operation);

        if (operation === "exit") {
          console.log("Exiting...");
          process.exit();
          
        }

        switch (operation) {
          case "checkBalance":
            console.log("check bl");
            emitter.emit("checkBalance", user);
            // process.exit();
            break;

          case "deposit":
          case "withdraw":
          case "viewTransactions":
            const amount = parseFloat(prompt("Enter amount: "));
            performOperation(operation, user, amount);
            break;
          default:
            console.log("Invalid operation.");
        }
      // }

      break;
    case "2":
      const name = prompt("Enter your name: ");
      const users = loadUserData();
      addUser(users, name);
      saveUserData(users);
      break;
    default:
      console.log("Invalid choice.");
  }
};

main();
