import app from "../js/firebaseConfig.js";
import { getFirestore, collection, addDoc, getDocs , query as firestoreQuery, where , updateDoc} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const db = getFirestore(app);

// modal js
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

let cashAmount = 0;
let savingsAmount = 0;
let bankAmount = 0;

document.getElementById("cash-amount").innerHTML = cashAmount;
document.getElementById("savings-amount").innerHTML = savingsAmount;
document.getElementById("bank-amount").innerHTML = bankAmount;

const accountTypeDropDown = document.getElementById("accountDropDown");
const cashOption = document.createElement("option");
cashOption.value = "cash";
cashOption.textContent = "Cash";
const savingsOption = document.createElement("option");
savingsOption.value = "savings";
savingsOption.textContent = "Savings";
accountTypeDropDown.appendChild(cashOption);
accountTypeDropDown.appendChild(savingsOption);


function getAccount() {
  const userId = localStorage.getItem("userID");

  if (!userId) {
    console.log("User ID not found in local storage.");
    return;
  }

  const accountsCollection = collection(db, "accounts");
  const query = firestoreQuery(accountsCollection, where("userId", "==", userId));

  getDocs(query)
    .then((querySnapshot) => {
      let totalAmount = 0;
      cashAmount = 0;
      savingsAmount = 0;
      const accountTypeDropDown = document.getElementById("accountDropDown");
      const existingOptions = Array.from(accountTypeDropDown.options);
      const accountListContainer = document.getElementById("account-list-container");
      accountListContainer.innerHTML = "";

      if (querySnapshot.empty) {
        addDefaultAccounts(userId)
          .then(() => {
            console.log("Default accounts added successfully!");
            getAccount(); 
          })
          .catch((error) => {
            console.error("Error adding default accounts:", error);
          });
      } else {
        querySnapshot.forEach((doc) => {
          const accountData = doc.data();
          console.log("Account ID:", doc.id);
          console.log("Account Type:", accountData.accountType);
          console.log("Amount:", accountData.amount);
          const liElement = document.createElement("li");
          liElement.classList.add("list-group-item");
          liElement.innerHTML = `${accountData.accountType}<span style="float: right;">${accountData.amount}</span>`;
          accountListContainer.appendChild(liElement);

          if (accountData.accountType === "cash") {
            cashAmount = accountData.amount;
            document.getElementById("cash-amount").innerHTML = cashAmount;
          } else if (accountData.accountType === "savings") {
            savingsAmount = accountData.amount;
            document.getElementById("savings-amount").innerHTML = savingsAmount;
          } else {
            totalAmount += parseFloat(accountData.amount);
          }

          const existingOption = existingOptions.find((option) => option.value === accountData.accountType);
          if (!existingOption) {
            const option = document.createElement("option");
            option.value = accountData.accountType;
            option.textContent = accountData.accountType;
            accountTypeDropDown.appendChild(option);
          }
        });

        console.log("Total Amount:", totalAmount);

        bankAmount = totalAmount;
        document.getElementById("bank-amount").innerHTML = bankAmount;

        const total = cashAmount + savingsAmount + bankAmount;
        const sum = total;
        document.getElementById("net-total").innerHTML = `${sum}<span>pkr</span>`;
      }
    })
    .catch((error) => {
      console.error("Error retrieving accounts:", error);
    });
}

function addDefaultAccounts(userId) {
  const defaultAccounts = [
    { accountType: "cash", amount: 1000 },
    { accountType: "savings", amount: 500 }
  ];

  const promises = defaultAccounts.map((account) =>
    addDoc(collection(db, "accounts"), {
      accountType: account.accountType,
      amount: account.amount,
      userId: userId,
    })
  );

  return Promise.all(promises);
}

document.getElementById("createbutton").addEventListener("click", createAccount);

// Create Account
function createAccount() {
  const accountType = document.getElementById("accountType").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const userId = localStorage.getItem("userID");

  addDoc(collection(db, "accounts"), {
    accountType: accountType,
    amount: amount,
    userId: userId,
  })
    .then(() => {
      console.log("Account created successfully!");
      alert("Account created successfully!");
      document.getElementById("accountType").value = "";
      document.getElementById("amount").value = "";
      closeModal();
      location.reload();
    })
    .catch((error) => {
      console.error("Error creating account:", error);
    });
}

// Fire a transaction
const transactionForm = document.getElementById("add-transaction");
transactionForm.addEventListener("submit", fireTransaction);

function fireTransaction(e) {
  e.preventDefault();
  const transactionAmount = parseFloat(transactionForm.tamount.value);
  const transactionType = transactionForm.transactionType.value;
  const transactionAccountType = transactionForm.transactionAccountType.value;
  const transactionCategory = transactionForm.category.value;
  const date = new Date();
  const userId = localStorage.getItem("userID");

  if (transactionAmount <= 0) {
    alert("Cannot take negative amount inputs.");
  } else {
    addDoc(collection(db, "transactions"), {
      amount: transactionAmount,
      type: transactionType,
      accountType: transactionAccountType,
      category: transactionCategory,
      date: date,
      userId: userId,
    })
      .then(() => {
        console.log("Transaction created successfully!");
        if (transactionType === "income") {
          if (transactionAccountType === "cash") {
            cashAmount += transactionAmount;
          } else if (transactionAccountType === "savings") {
            savingsAmount += transactionAmount;
          } else {
            bankAmount += transactionAmount;
          }
        } else if (transactionType === "expense") {
          if (transactionAccountType === "cash") {
            if (transactionAmount <= cashAmount) {
              cashAmount -= transactionAmount;
            } else {
              alert("Insufficient funds in Cash account.");
              return;
            }
          } else if (transactionAccountType === "savings") {
            if (transactionAmount <= savingsAmount) {
              savingsAmount -= transactionAmount;
            } else {
              alert("Insufficient funds in Savings account.");
              return;
            }
          } else {
            if (transactionAmount <= bankAmount) {
              bankAmount -= transactionAmount;
            } else {
              alert("Insufficient funds in Bank account.");
              return;
            }
          }
        }

        alert("Transaction created successfully!");
        transactionForm.reset();
        document.getElementById("cash-amount").innerHTML = cashAmount;
        document.getElementById("savings-amount").innerHTML = savingsAmount;
        document.getElementById("bank-amount").innerHTML = bankAmount;
        const total = cashAmount + savingsAmount + bankAmount;
        document.getElementById("net-total").innerHTML = `${total}<span>pkr</span>`;
        updateAccountAmounts(userId, cashAmount, savingsAmount, bankAmount);
      })
      .catch((error) => {
        console.error("Error creating transaction:", error);
      });
  }
}

function updateAccountAmounts(userId, cashAmount, savingsAmount, bankAmount) {
  const accountsCollection = collection(db, "accounts");
  const query = firestoreQuery(accountsCollection, where("userId", "==", userId));

  getDocs(query)
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const accountData = doc.data();
        if (accountData.accountType === "cash") {
          updateDoc(doc.ref, { amount: cashAmount })
            .then(() => {
              console.log("Cash account amount updated successfully!");
            })
            .catch((error) => {
              console.error("Error updating cash account amount:", error);
            });
        } else if (accountData.accountType === "savings") {
          updateDoc(doc.ref, { amount: savingsAmount })
            .then(() => {
              console.log("Savings account amount updated successfully!");
            })
            .catch((error) => {
              console.error("Error updating savings account amount:", error);
            });
        } else {
          updateDoc(doc.ref, { amount: bankAmount })
            .then(() => {
              console.log("Bank account amount updated successfully!");
            })
            .catch((error) => {
              console.error("Error updating bank account amount:", error);
            });
        }
      });
    })
    .catch((error) => {
      console.error("Error retrieving accounts for updating amounts:", error);
    });
}

function getTransactions() {
  const userId = localStorage.getItem("userID");

  if (!userId) {
    console.log("User ID not found in local storage.");
    return;
  }

  const transactionsCollection = collection(db, "transactions");
  const query = firestoreQuery(transactionsCollection, where("userId", "==", userId));

  getDocs(query)
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const transactionData = doc.data();
        const formattedDate = new Date(transactionData.date.toDate()).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        let amountColumn;
        let transactionAmount = transactionData.amount;
        if (transactionData.type === "income") {
          amountColumn = `<td class="income-text-color">+${transactionAmount}</td>`;
        } else {
          amountColumn = `<td class="expense-text-color">-${transactionAmount}</td>`;
        }

        const transactionTable = document.getElementById("transaction-table-body");
        const tableRow = document.createElement("tr");
        tableRow.innerHTML += `
          <td>${transactionData.category}</td>
          <td>${transactionData.accountType}</td>
          <td>${formattedDate}</td>
          <td>${amountColumn}</td>
        `;
        transactionTable.appendChild(tableRow);
      });
      // Calculate total income and expense
      calculateIncomeExpenseChart(querySnapshot)
    })
    .catch((error) => {
      console.error("Error retrieving transactions:", error);
    });
}

// Call the necessary functions on document load
document.addEventListener("DOMContentLoaded", () => {
  getAccount();
  getTransactions();
});


function calculateIncomeExpenseChart(querySnapshot) {
  let totalIncome = 0;
  let totalExpense = 0;

  querySnapshot.forEach((doc) => {
    const transactionData = doc.data();
    if (transactionData.type === "income") {
      totalIncome += transactionData.amount;
    } else if (transactionData.type === "expense") {
      totalExpense += transactionData.amount;
    }
  });

  console.log("Total Income:", totalIncome);
  console.log("Total Expense:", totalExpense);

  const data = {
    datasets: [{
      data: [totalExpense, totalIncome],
      backgroundColor: ['rgb(0, 112, 187)', 'rgb(169, 1, 37)'],
    }],
    labels: ['Total Expense', 'Total Income'],
  };

  const ctx = document.getElementById('pieChart').getContext('2d');
  const pieChart = new Chart(ctx, {
    type: 'pie',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

// calculateIncomeExpenseChart(querySnapshot);
