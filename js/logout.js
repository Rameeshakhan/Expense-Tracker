import app from "../js/firebaseConfig.js"    
import {getAuth ,  signOut} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js"

const auth = getAuth(app)

const logoutButton = document.querySelector("#logout")
logoutButton.addEventListener("click", logoutUser)

let userIsLoggedOut = false

// Logout function
function logoutUser(userIsLoggedOut) {
    signOut(auth)
      .then(() => {
        console.log("User logged out successfully");
        window.location.href = "../pages/login.html";
        userIsLoggedOut = true
      })
      .catch((error) => {
        console.log("Logout error:", error.message);
      });
    }
    

if(userIsLoggedOut) {
  sessionStorage.clear();
  history.replaceState(null, null, location.href);
  window.onpopstate = function () {
    if (sessionStorage.getItem('isLoggedIn')) {
      history.go(1);
    }
  };
  }
  