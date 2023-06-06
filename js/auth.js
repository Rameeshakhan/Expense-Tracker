import app from "../js/firebaseConfig.js"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js"
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const auth = getAuth(app)

const currentPath = window.location.pathname;

if (currentPath.includes("signup.html")) {
  let signupForm = document.querySelector("#signup-form");
  signupForm.addEventListener("submit", userSignUp);

  function userSignUp(e) {
    e.preventDefault();
    const username = signupForm.username.value;
    const email = signupForm.email.value;
    const password = signupForm.password.value;

    if (username === "" | email === "" | password === "") {
      alert("Please Fill all the feids first")
    } else if (password.length <= 6) {
      alert("Password should be more than 6 Characters")
    } else {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;

          const db = getFirestore(app);
          const usersCollection = collection(db, "users");

          const userData = {
            username: username,
            email: email,
            password: password,
          };

          addDoc(usersCollection, userData)
            .then(() => {
              console.log("User data stored in Firestore");
              alert("Signed Up");
              window.location.href = "../pages/login.html";
            })
            .catch((error) => {
              console.log("Error storing user data in Firestore:", error.message);
            });
        })
        .catch((error) => {
          console.log("Sign up error:", error.message);
          alert(error.message)
        });
    }

  }
} else if (currentPath.includes("login.html")) {
  let loginForm = document.querySelector("#loginform");
  loginForm.addEventListener("submit", loginUser);

  function loginUser(e) {
    e.preventDefault()
    const email = loginForm.email.value
    const password = loginForm.password.value

    if (email === "" | password === "") {
      alert("Fill the details first")
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          console.log("USer Loged IN")
          alert("Successfully Loged In")
          localStorage.setItem("userID" , user.uid)
          window.location.href = "../pages/dashboard.html"
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode + " : " + errorMessage)
          alert(errorMessage)
        });
    }
  }
}

