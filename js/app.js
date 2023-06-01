 // JavaScript code to create the typing effect
 const heading = document.getElementById('typing-heading');
 const text = "Manage Your Finance";
 let index = 0;

 function typeEffect() {
   if (index < text.length) {
     heading.innerHTML += text.charAt(index);
     index++;
     setTimeout(typeEffect, 200); // Adjust the typing speed by changing the timeout value (in milliseconds)
   }
 }
 typeEffect();