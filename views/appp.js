const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
const signup=document.getElementById('signup');

signup.addEventListener('click', ()=>{
  if(validateForm()){
  
    container.classList.remove("right-panel-active");
  }
})

signUpButton.addEventListener('click', () => {
 
    container.classList.add("right-panel-active");
  
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});


const form = document.getElementById('registrationForm');

form.addEventListener('submit', (e) => {
  e.preventDefault(); // Prevent the default form submission
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Create an object with the form data
  const formData = {
    name: name,
    email: email,
    password: password
  };

  // Make an HTTP POST request to the server
  fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
    .then(response => response.text())
    .then(data => {
      console.log(data); // Server response
      // You can perform additional actions here, such as displaying a success message
    })
    .catch(error => {
      console.error('Error:', error);
      // Handle error scenarios
    });
});


function validateForm() {
  // Get the form values
  var name = document.forms["registrationForm"]["name"].value;
  var email = document.forms["registrationForm"]["email"].value;
  var password = document.forms["registrationForm"]["password"].value;
  var confirmPassword = document.forms["registrationForm"]["conpassword"].value;
  
  // Check that all required fields are filled out
  if (name == "" || email == "" || password == "" || confirmPassword == "") {
    alert("All fields are required. Please complete the form.");
    return false;
  }
  

  
  // Check that the password and confirm password fields match
  if (password != confirmPassword) {
    alert("The password and confirm password fields do not match.");
    return false;
  }
  
  // If all validation checks pass, submit the form
  return true;
}




