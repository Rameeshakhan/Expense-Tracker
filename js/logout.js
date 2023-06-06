import app from "../js/firebaseConfig.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

const auth = getAuth(app);

const logoutButton = document.getElementById("logoutButton");
logoutButton.addEventListener("click", logoutUser);

function logoutUser() {
  signOut(auth)
    .then(() => {
      console.log("User logged out successfully");
      localStorage.clear();
      window.history.pushState({}, "", "../pages/login.html");
      window.location.href = "../pages/login.html";
    })
    .catch((error) => {
      console.log("Logout error:", error.message);
    });
}
