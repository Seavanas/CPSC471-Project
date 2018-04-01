/**
 * Created by Ryan on 2018-03-23.
 */
function toggleSignIn() {
  if (firebase.auth().currentUser) {
    firebase.database().ref("Users/" + firebase.auth().currentUser.uid).once('value').then(function(snapshot){
      console.log(snapshot.val());
      if(!snapshot.val()){
        window.location.href = "/#!/register"
      }else{
        // displayUserData(snapshot.val());
        window.location.href = "/#!/home";
      }
    });
  } else {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    if(!validateEmail(email)){
      $("#userError").css("visibility", "visible");
      $("#userError").text("Please enter a valid email.");
      return
    }

    if(password.length <= 1){
      $("#userError").css("visibility", "visible");
      $("#userError").text("Account does not exist/You have entered an incorrect password.");
    }

    firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
      //Handles Errors here
      let errorCode = error.code;
      let errorMessage = error.message;
      $("#userError").css("visibility", "visible");
      $("#userError").text(errorMessage);
      console.log(error);
    });
  }
}

function validateEmail(email) {
  let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function toggleSignUp() {
  let firstName = $("#firstName").val();
  let lastName = $("#lastName").val();
  let email = $("#email").val();
  let password = $("#password").val();
  firebase.auth().onAuthStateChanged(function(user) {
    let firstName = $("#firstName").val();
    let lastName = $("#lastName").val();
    let email = $("#email").val();
    let password = $("#password").val();
    if(user) {
      console.log("hit");
      if(!firstName.length<1 && !lastName.length<1) {
        firebase.database().ref("users/" + user.uid).update({
          userType: "student",
          email: email,
          uid: firebase.auth().currentUser.uid,
          firstName: firstName,
          lastName: lastName,
          fullName: firstName + " " + lastName
        });
        console.log("success!");
        window.location.href = "/#!/home";
      }
    }
  });
  if(!firstName.length<1 && !lastName.length<1 && validateEmail(email) && !password.length<8){
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
      // Handle Errors here.
      let errorCode = error.code;
      let errorMessage = error.message;
      // ...
      return null;
    });
  }
}