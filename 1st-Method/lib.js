const readline = require("readline");
const fs = require("fs");
const EventEmitter = require("events");
const emitter = new EventEmitter();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * @param {string} question
 * @returns {Promise<string>}
 * A function that returns a promise that resolves to a string
 * @example prompt("What is your name?").then(name => console.log(name))
 * @example async function getName() {
 *  const name = await prompt("What is your name?");
 *  console.log(name);
 * }
 */
function prompt(question) {
  return new Promise((resolve, _) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 *
 * @param {number} length
 * @returns number
 * Generates a random number of a given length
 * @example generateRandomNumber(4) => 1234
 * @example generateRandomNumber(6) => 123456
 */
function generateRandomNumber(length) {
  return Math.floor(
    10 ** (length - 1) + Math.random() * 9 * 10 ** (length - 1)
  );
}

/**
 *
 * @param {Array<any>} accounts
 * @returns Promise<boolean>
 *
 * A function that persists the accounts to a file
 * @example persistAccounts(accounts).then(() => console.log("Accounts persisted"))
 * @example async function persist(accounts) {
 * const result = await persistAccounts(accounts);
 * console.log(result);
 * }
 */
const persistAccounts = (accounts) => {
  return new Promise((resolve, reject) => {
    fs.writeFile("./accounts.json", JSON.stringify(accounts), (err) => {
      if (err) {
        reject("Error persisting accounts");
      }
      resolve(true);
    });
  });
};

/**
 * @param {Object} currentAccount
 * @returns Promise<void>
 * A function that renders the user menu (balance check, withdraw, deposit, transaction history, logout)
 * @example renderUserMenu().then(() => console.log("User menu rendered"))
 * @example async function renderMenu() {
 * await renderUserMenu();
 * console.log("User menu rendered");
 * }
 */
const renderUserMenu = async (currentAccount) => {
  if(!currentAccount) return console.log("No account found");
  console.log(`------------ Welcome ${currentAccount.name} --------------`);
  do {
    console.log("1. Check Balance");
    console.log("2. Withdraw");
    console.log("3. Deposit");
    console.log("4. Transaction History");
    console.log("5. Logout");
    const option = await prompt("Choose an option: ");
    switch (option) {
      case "1":
        emitter.emit("balanceCheck");
        break;
      case "2":
        const amount = await prompt("Enter amount to withdraw: ");
        emitter.emit("withdraw", amount);
        break;
      case "3":
        const depositAmount = await prompt("Enter amount to deposit: ");
        emitter.emit("deposit", depositAmount);
        break;
      case "4":
        emitter.emit("history");
        break;
      case "5":
        break;
      default:
        console.log("Invalid Option");
        break;
    }
  } while (currentAccount);
};

/**
 * @returns Promise<void>
 * A function that renders the main menu (create account, login, exit)
 * @example renderMainMenu().then(() => console.log("Main menu rendered"))
 * @example async function renderMenu() {
 * await renderMainMenu();
 * console.log("Main menu rendered");
 * }
 */
const renderMainMenu = async () => {
  console.log("Hello to the ATM");
  console.log("1. Create Account");
  console.log("2. Login");
  console.log("3. Exit");
  const option = await prompt("Choose an option: ");
  switch (option) {
    case "1":
      const name = await prompt("Enter your name: ");
      emitter.emit("createAccount", name);
      break;
    case "2":
      const id = await prompt("Enter your id: ");
      const pin = await prompt("Enter your pin: ");
      emitter.emit("login", id, pin);
      break;
    case "3":
      console.log("Exit");
      // persist accounts to the file before exiting the program
      await persistAccounts();
      rl.close();
      break;
    default:
      console.log("Invalid Option");
      break;
  }
};

module.exports = {
  prompt,
  generateRandomNumber,
  persistAccounts,
  renderUserMenu,
  renderMainMenu,
  emitter,
  rl,
};
