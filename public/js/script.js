/**
 * Created by Ryan on 2018-03-23.
 */

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    // window.location.href = "/#!/";
    let displayName = user.displayName;
    let email = user.email;
    let photoURL = user.photoURL;
    let emailVerified = user.emailVerified;
    let isAnonymous = user.isAnonymous;
    let uid = user.uid;
    let providerData = user.providerData;
    firebase.database().ref("Users/" + uid).once('value').then(function(snapshot){
        displayUserData(snapshot.val());
    });
  }
});

function displayUserData(user){
  $(".authed").css("display","unset");
  $(".authName").text(user.fullName);
}

function toggleSignIn() {
  if (firebase.auth().currentUser) {
    firebase.database().ref("Users/" + firebase.auth().currentUser.uid).once('value').then(function(snapshot){
        // displayUserData(snapshot.val());
        window.location.href = "/#!/home";
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
    window.location.href = "/#!/home";
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
        firebase.database().ref("Users/" + user.uid).update({
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

function displaySubCommentSection(post_comment_ID) {
  $('#sub_'+post_comment_ID).css('display', 'block');
}

function cancelSubCommentSection(post_comment_ID) {
  $('#sub_'+post_comment_ID).css('display', 'none');
}

function createSubComment(post_comment_ID) {
  let subCommentRef = firebase.database().ref("/SubComment/");
  subCommentRef.once("value", function(snapshot) {
    if (!snapshot.hasChild(post_comment_ID))
    {
      console.log("no");
      subCommentRef.child(post_comment_ID).set({
        temp: 0
      });
    }

    let postCommentRef = subCommentRef.child(post_comment_ID);
    let key = postCommentRef.push().key;
    let content = $('#sub_comment_content_'+post_comment_ID).val();
    postCommentRef.child(key).set({
      Text: content,
      Timestamp: firebase.database.ServerValue.TIMESTAMP,
      User_ID: firebase.auth().currentUser.uid
    });
    $('#sub_comment_content_'+post_comment_ID).val("");
    postCommentRef.child("temp").remove();
  });
}

function loadSubComment (snap) {
  firebase.database().ref("Users/" + snap.val().User_ID).once('value').then(user => {
    $("." + snap.val().User_ID).text(user.val().fullName);
    // Load SubComments Of Comment
    firebase.database().ref("SubComment/" + snap.key).on('child_added', snap2 => {
      let edit_link = "</h6>";
      if (firebase.auth().currentUser.uid == snap2.val().User_ID)
        edit_link = " <a href='javascript:void(0)' style='color: red' onClick='displayEditCommentSection(\""+snap2.key+"\")'>Edit</a></h6>";

      let comment_text = snap2.val().Text;
      if (firebase.auth().currentUser.uid == snap2.val().User_ID)
        comment_text = "<div id='comment_text_"+snap2.key+"'>"+snap2.val().Text+"</div>";

      let subcomment = "<li class='list-group-item'>"
        + "<h6><span class='" + snap2.val().User_ID + "'></span><span style='color: grey'>:- " + new moment(snap2.val().Timestamp).fromNow() + "</span>"
        +" <a href='javascript:void(0)' style='color: red' onClick='displaySubCommentSection(\""+snap2.key+"\")'>Reply</a>"
        + edit_link
        + comment_text
        + "<ul id='" + snap2.key + "' class='list-group'></ul>"
        + "</li>"
        + "<div id='sub_"+snap2.key+"' style='padding-top: 10px; display: none;'>"
        + "<p>Insert reply below:</p>"
        + "<div style='padding-bottom: 10px;'><textarea id='sub_comment_content_"+snap2.key+"' class='form-control' rows='2'></textarea></div>"
        + "<p><button type='button' class='btn btn-primary btn-sm' onClick='createSubComment(\""+snap2.key+"\")'>Post Reply</button> "
        + "<button type='button' class='btn btn-basic btn-sm' onClick='cancelSubCommentSection(\""+snap2.key+"\")'>Cancel</button></p>"
        + "</div>";
      $("#" + snap.key).prepend(subcomment);
      firebase.database().ref("Users/" + snap2.val().User_ID).once('value').then(user2 => {
        $("." + snap2.val().User_ID).text(user.val().fullName);
      });

      loadSubComment(snap2);
    });
  });
}

let comment_text= "";   //Set as global because can't pass multi line string as a parameter using JavaScript
function displayEditCommentSection(edit_comment_ID) {
  let div_ID = "#comment_text_"+edit_comment_ID;
  comment_text = $(div_ID).text();
  console.log(comment_text);
  let edit_comment_section = "<div style='padding-bottom: 10px;'>"
  + "<textarea id='edit_comment_content_"+edit_comment_ID+"' class='form-control' rows='2'>"+comment_text+"</textarea></div>"
  + "<p><button type='button' class='btn btn-primary btn-sm' onClick='editComment(\""+edit_comment_ID+"\")'>Edit</button> "
  + "<button type='button' class='btn btn-basic btn-sm' onClick='cancelEditCommentSection(\""+edit_comment_ID+"\")'>Cancel</button></p>";
  $(div_ID).html(edit_comment_section);
}

function cancelEditCommentSection(edit_comment_ID) {
  console.log(comment_text);
  let div_ID = "#comment_text_"+edit_comment_ID;
  $(div_ID).text(comment_text);
}

function editComment(edit_comment_ID) {

}

function changePostDisplay(routeParams){
  $("#course").text(routeParams.Course_ID);
  $("#course").attr('href', "/#!/course/" + routeParams.Course_ID);

  firebase.database().ref("Post/" + routeParams.Course_ID+ "/" + routeParams.Post_ID).once('value').then(snap => {
    $("#post").text(snap.val().Title);
    $("#title").text(snap.val().Title);
    $("#content").text(snap.val().Post_content);
    firebase.database().ref("Users/" + snap.val().User_ID).once('value').then(snap => {
      $("#author").text(snap.val().fullName);
      if (firebase.auth().currentUser.uid == snap.val().uid)
        $("#title_row").append("<div class='col'><div class='text-right'><a href='javascript:void(0)' class='btn btn-outline-danger'>Edit Post</a></div></div>");
    });
    $("#time_created").text(new moment(snap.val().Timestamp).fromNow());
  });

  // Load Comments
  firebase.database().ref("Comment/" + routeParams.Post_ID).on('child_added', snap => {
    let edit_link = "</h6>";
    if (firebase.auth().currentUser.uid == snap.val().User_ID)
      edit_link = " <a href='javascript:void(0)' style='color: red' onClick='displayEditCommentSection(\""+snap.key+"\")'>Edit</a></h6>";

    let comment_text = snap.val().Text;
    if (firebase.auth().currentUser.uid == snap.val().User_ID)
      comment_text = "<div id='comment_text_"+snap.key+"'>"+snap.val().Text+"</div>";

    let comment = "<li class='list-group-item'>"
      + "<h6><span class='" + snap.val().User_ID + "'></span><span style='color: grey'>:- " + new moment(snap.val().Timestamp).fromNow() + "</span>"
      +" <a href='javascript:void(0)' style='color: red' onClick='displaySubCommentSection(\""+snap.key+"\")'>Reply</a>"
      + edit_link
      + comment_text
      + "<ul id='" + snap.key + "' class='list-group'></ul>"
      + "</li>"
      + "<div id='sub_"+snap.key+"' style='padding-top: 10px; display: none;'>"
      + "<p>Insert reply below:</p>"
      + "<div style='padding-bottom: 10px;'><textarea id='sub_comment_content_"+snap.key+"' class='form-control' rows='2'></textarea></div>"
      + "<p><button type='button' class='btn btn-primary btn-sm' onClick='createSubComment(\""+snap.key+"\")'>Post Reply</button> "
      + "<button type='button' class='btn btn-basic btn-sm' onClick='cancelSubCommentSection(\""+snap.key+"\")'>Cancel</button></p>"
      + "</div>";
    $("#commentList").prepend(comment);
    loadSubComment(snap);
  });
}

function toggleSignOut(){
  firebase.auth().signOut();
  $(".authed").css("display","none");
  window.location.href = "/#!/";
}
