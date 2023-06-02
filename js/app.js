// //firebase authentication
// // const app = firebase.initializeApp(firebaseConfig);
// document.addEventListener("DOMContentLoaded", function() {
// const username = document.getElementById("signup-username")
// const email = document.getElementById("signup-email")
// const password = document.getElementById("signup-password")
// const signupForm = document.getElementById("signup-form")

// signupForm.addEventListener("submit" , signUp)

// function signUp(e) {
//   e.preventDefault();
//   const usernameValue = username.value;
//   const emailValue = email.value;
//   const passwordValue = password.value;

//   // const app = initializeApp(firebaseConfig);
//   firebase.auth().createUserWithEmailAndPassword(emailValue, passwordValue)
//     .then((userCredential) => {
//       // Sign-up successful
//       const user = userCredential.user;
//       console.log("Sign-up successful!", user);
//       // Additional logic after successful sign-up
//     })
//     .catch((error) => {
//       // Sign-up failed
//       const errorCode = error.code;
//       const errorMessage = error.message;
//       console.error("Sign-up failed", errorCode, errorMessage);
//       // Handle sign-up error, display error message, etc.
//     });
// }

// });

// Get the sign-up form element
const signupForm = document.getElementById("signup-form");

// Add an event listener to the form
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get user input values
  const email = signupForm.email.value;
  const password = signupForm.password.value;

  // Create a new user with email and password
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Sign-up successful, you can redirect the user or perform other actions here
      console.log("Sign up successful!");
    })
    .catch((error) => {
      // Handle sign-up errors
      console.log(error.message);
    });
});

