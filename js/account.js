import app from "../js/firebaseConfig.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const db = getFirestore(app);

var modal = document.getElementById("myModal");
var btn = document.getElementById("openModalBtn");
var closeBtn = document.getElementsByClassName("close")[0];

function openModal() {
  modal.style.display = "block";
}

function closeModal() {
  modal.style.display = "none";
}

btn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);

document.addEventListener("DOMContentLoaded", updateData)

// Update the data
function updateData() {
  // Refresh account list
  const accountListContainer = document.getElementById("account-list-container");
  accountListContainer.innerHTML = "";
  let sum = 0;
  let cashAmount = 0;
  let bankAmount = 0;
  let savingsAmount = 0;

  const usersCollection = collection(db, "account");
  getDocs(usersCollection)
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const accountData = doc.data();
        const liElement = document.createElement("li");
        liElement.classList.add("list-group-item");
        liElement.innerHTML = `${accountData.accountType}<span style="float: right;">${accountData.amount}</span>`;
        accountListContainer.appendChild(liElement);
        let amount = doc.data().amount;
        sum += amount;
        if (accountData.accountType === "Cash") {
          cashAmount += accountData.amount;
        } else if (accountData.accountType === "Bank") {
          bankAmount += accountData.amount;
        } else if (accountData.accountType === "Savings") {
          savingsAmount += accountData.amount;
        }
      });

      // Fetch and display transactions
      const transactionTableBody = document.getElementById("transaction-table-body");
      transactionTableBody.innerHTML = "";
      onSnapshot(collection(db, "transactions"), (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const transactionData = change.doc.data();
          const tableRow = document.createElement("tr");
          const formattedDate = new Date(transactionData.date.toDate()).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          let amountColumn;
          let transactionAmount = transactionData.amount;
          if (transactionData.type === "income") {
            amountColumn = `<td class="income-text-color">+${transactionAmount}</td>`;
            sum += transactionAmount;
            if (transactionData.accountType === "Cash") {
              cashAmount += transactionAmount;
            } else if (transactionData.accountType === "Bank") {
              bankAmount += transactionAmount;
            } else if (transactionData.accountType === "Savings") {
              savingsAmount += transactionAmount;
            }
          } else {
            amountColumn = `<td class="expense-text-color">-${transactionAmount}</td>`;
            sum -= transactionAmount;
            if (transactionData.accountType === "Cash") {
              cashAmount -= transactionAmount;
            } else if (transactionData.accountType === "Bank") {
              bankAmount -= transactionAmount;
            } else if (transactionData.accountType === "Savings") {
              savingsAmount -= transactionAmount;
            }
          }

          tableRow.innerHTML += `
            <td>${transactionData.category}</td>
            <td>${transactionData.accountType}</td>
            <td>${formattedDate}</td>
            ${amountColumn}
          `;
          transactionTableBody.appendChild(tableRow);
        });

        document.getElementById("cash-amount").innerHTML = cashAmount;
        document.getElementById("bank-amount").innerHTML = bankAmount;
        document.getElementById("savings-amount").innerHTML = savingsAmount;
        document.getElementById("net-total").innerHTML = `${sum}<span> pkr</span>`;
        console.log("Total sum:", sum);
      });

      const createButton = document.getElementById("createbutton");
      createButton.addEventListener("click", createAccount);

      const transactionForm = document.getElementById("add-transaction");
      transactionForm.addEventListener("submit", addTransaction);
    })
    .catch((error) => {
      console.log("Error retrieving account data from Firestore:", error.message);
    });
}

function createAccount() {
  const accountTypeSelect = document.getElementById("select");
  const amountInput = document.getElementById("amount");
  const accountType = accountTypeSelect.value;
  const amount = parseFloat(amountInput.value);

  addDoc(collection(db, "account"), {
    accountType: accountType,
    amount: amount,
  })
    .then(() => {
      closeModal();
      accountTypeSelect.value = "";
      amountInput.value = "";
    })
    .catch((error) => {
      console.error("Error creating account:", error);
    });
}

// Transaction form handle
const transactionForm = document.getElementById("add-transaction");
transactionForm.addEventListener("submit", addTransaction);

function addTransaction(e) {
  e.preventDefault();
  const transactionAmount = parseFloat(transactionForm.tamount.value);
  const transactionType = transactionForm.transactionType.value;
  const transactionAccountType = transactionForm.transactionAccountType.value;
  const transactionCategory = transactionForm.category.value;
  const date = new Date();
  if(transactionAmount === "" | transactionType === "" | transactionAccountType ==="" | transactionCategory === ""){
    alert("Fill all field to proceed with the transaction")
  }else{
    const transactionsCollection = collection(db, "transactions");
  
    if (transactionType === "income") {
      addIncomeTransaction(transactionCategory, transactionAccountType, date, transactionAmount, transactionsCollection);
    } else {
      addExpenseTransaction(transactionCategory, transactionAccountType, date, transactionAmount, transactionsCollection);
    }
  }
  }

function addIncomeTransaction(category, accountType, date, amount, transactionsCollection) {
  addDoc(transactionsCollection, {
    category: category,
    accountType: accountType,
    date: date,
    amount: amount,
    type: "income",
  })
    .then(function (docRef) {
      console.log("Transaction added with ID: ", docRef.id);
      if (accountType === "Cash") {
        cashAmount += amount;
      } else if (accountType === "Bank") {
        bankAmount += amount;
      } else if (accountType === "Savings") {
        savingsAmount += amount;
      }
      document.getElementById("cash-amount").innerHTML = cashAmount;
      document.getElementById("bank-amount").innerHTML = bankAmount;
      document.getElementById("savings-amount").innerHTML = savingsAmount;
    })
    .catch(function (error) {
      console.error("Error adding transaction: ", error);
    });
}

function addExpenseTransaction(category, accountType, date, amount, transactionsCollection) {
  addDoc(transactionsCollection, {
    category: category,
    accountType: accountType,
    date: date,
    amount: amount,
    type: "expense",
  })
    .then(function (docRef) {
      console.log("Transaction added with ID: ", docRef.id);
      if (accountType === "Cash") {
        cashAmount -= amount;
      } else if (accountType === "Bank") {
        bankAmount -= amount;
      } else if (accountType === "Savings") {
        savingsAmount -= amount;
      }
      document.getElementById("cash-amount").innerHTML = cashAmount;
      document.getElementById("bank-amount").innerHTML = bankAmount;
      document.getElementById("savings-amount").innerHTML = savingsAmount;
    })
    .catch(function (error) {
      console.error("Error adding transaction: ", error);
    });
}