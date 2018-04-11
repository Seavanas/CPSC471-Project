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

function displaySubCommentSection(comment_ID) {
  $('#sub_'+comment_ID).css('display', 'block');
}

function cancelSubCommentSection(comment_ID) {
  $('#sub_'+comment_ID).css('display', 'none');
}

function createSubComment(comment_ID) {
  let subCommentRef = firebase.database().ref("/SubComment/");
  subCommentRef.once("value", function(snapshot) {

    let commentRef = subCommentRef.child(comment_ID);
    let key = commentRef.push().key;
    let content = $('#sub_comment_content_'+comment_ID).val();
    commentRef.child(key).set({
      Text: content,
      Timestamp: firebase.database.ServerValue.TIMESTAMP,
      User_ID: firebase.auth().currentUser.uid
    });
    $('#sub_comment_content_'+comment_ID).val("");
  });
  cancelSubCommentSection(comment_ID);
}

function displayEditCommentSection(edit_comment_ID, parent_ID, bool_post_comment) {
  let div_ID = "#comment_text_"+edit_comment_ID;
  let original_comment_text = $(div_ID).text();
  $("#edit_link_"+edit_comment_ID).attr('onclick', '');
  $(div_ID).attr('class', 'bg-dark text-white');
  $(div_ID).css('padding', '10px');
  let edit_comment_section = "<div style='padding-bottom: 10px;'>"
  + "<textarea id='edit_comment_content_"+edit_comment_ID+"' class='form-control' rows='2'>"+original_comment_text+"</textarea></div>"
  + "<div><button type='button' class='btn btn-primary btn-sm' onClick='editComment(\""+edit_comment_ID+"\", \""+parent_ID+"\", "+bool_post_comment+")'>Edit</button> "
  + "<button type='button' class='btn btn-basic btn-sm' onClick='cancelEditCommentSection(\""+edit_comment_ID+"\", \""+parent_ID+"\", "+bool_post_comment+")'>Cancel</button></div>";
  $(div_ID).html(edit_comment_section);
}

function cancelEditCommentSection(edit_comment_ID, parent_ID, bool_post_comment) {
  let div_ID = "#comment_text_"+edit_comment_ID;
  $("#edit_link_"+edit_comment_ID).attr('onclick', 'displayEditCommentSection("'+edit_comment_ID+'", "'+parent_ID+'", "'+bool_post_comment+'")');
  $(div_ID).attr('class', '');
  $(div_ID).css('padding', '');
  $(div_ID).text($("#edit_comment_content_"+edit_comment_ID).text());
}

function editComment(edit_comment_ID, parent_ID, bool_post_comment) {
  let div_ID = "#comment_text_"+edit_comment_ID;
  $("#edit_link_"+edit_comment_ID).attr('onclick', 'displayEditCommentSection("'+edit_comment_ID+'", "'+parent_ID+'", "'+bool_post_comment+'")');
  $(div_ID).attr('class', '');
  $(div_ID).css('padding', '');

  let parent_ref_string = "";
  if (bool_post_comment)
    parent_ref_string = "Comment/" + parent_ID + "/";
  else
    parent_ref_string = "SubComment/" + parent_ID + "/";

  let commentRef = firebase.database().ref(parent_ref_string + edit_comment_ID);
  let edit_comment_content_id = "#edit_comment_content_"+edit_comment_ID;
  let new_comment_content = $(edit_comment_content_id).val();
  commentRef.set({
    Text: new_comment_content,
    Timestamp: firebase.database.ServerValue.TIMESTAMP,
    User_ID: firebase.auth().currentUser.uid
  });
}

function deleteChildSubComment (delete_comment_ID) {
  let rootRef = firebase.database().ref("SubComment/" + delete_comment_ID);
  rootRef.once('value', snap => {
       snap.forEach(child => {
         deleteChildSubComment(child.key);
       });
  });
  rootRef.remove();
}

function deleteComment (delete_comment_ID, parent_ID, bool_post_comment) {
  let parent_ref_string = "";
  if (bool_post_comment)
    parent_ref_string = "Comment/" + parent_ID + "/";
  else
    parent_ref_string = "SubComment/" + parent_ID + "/";

  let commentRef = firebase.database().ref(parent_ref_string + delete_comment_ID);
  commentRef.remove();

  deleteChildSubComment(delete_comment_ID);
}

function loadSubComment (snap, routeParams) {
    // Load SubComments Of Comment
  firebase.database().ref("Courses/" + routeParams.Course_ID).once('value').then( snap3 => {
    firebase.database().ref("SubComment/" + snap.key).on('child_added', snap2 => {
      let edit_link = "";
      let delete_link = "</h6>";
      let comment_text = snap2.val().Text;
      if (firebase.auth().currentUser.uid == snap2.val().User_ID) {
        edit_link = " <a id='edit_link_" + snap2.key + "' href='javascript:void(0)' style='color: red' onClick='displayEditCommentSection(\"" + snap2.key + "\", \"" + snap.key + "\", false)'>Edit</a>";
        comment_text = "<div id='comment_text_" + snap2.key + "'>" + snap2.val().Text + "</div>";
      }
      if (firebase.auth().currentUser.uid == snap2.val().User_ID || firebase.auth().currentUser.uid == snap3.val().Admin){
        delete_link = " <a href='javascript:void(0)' style='color: red' onClick='deleteComment(\"" + snap2.key + "\", \"" + snap.key + "\", false)'>Delete</a>";
      }

      let subcomment = "<li id='comment_block_" + snap2.key + "' class='list-group-item'>"
        + "<h6><span class='" + snap2.val().User_ID + "'></span><span style='color: grey'>:- " + new moment(snap2.val().Timestamp).fromNow() + "</span>"
        + " <a href='javascript:void(0)' style='color: red' onClick='displaySubCommentSection(\"" + snap2.key + "\")'>Reply</a>"
        + edit_link
        + delete_link
        + "</h6>"
        + comment_text
        + "<div id='sub_" + snap2.key + "' class='bg-dark text-white' style='padding: 10px; display: none;'>"
        + "<p>Insert reply below:</p>"
        + "<div style='padding-bottom: 10px;'><textarea id='sub_comment_content_" + snap2.key + "' class='form-control' rows='2'></textarea></div>"
        + "<div><button type='button' class='btn btn-primary btn-sm' onClick='createSubComment(\"" + snap2.key + "\")'>Post Reply</button> "
        + "<button type='button' class='btn btn-basic btn-sm' onClick='cancelSubCommentSection(\"" + snap2.key + "\")'>Cancel</button></div>"
        + "</div>"
        + "<ul id='" + snap2.key + "' class='list-group'></ul>"
        + "</li>";
      $("#" + snap.key).prepend(subcomment);
      firebase.database().ref("Users/" + snap2.val().User_ID).once('value').then(user2 => {
        $("." + snap2.val().User_ID).text(user2.val().fullName);
      });

      loadSubComment(snap2, routeParams);
    });
  });

    firebase.database().ref("SubComment/" + snap.key).on('child_changed', snap2 => {
      $("#comment_text_"+snap2.key).text(snap2.val().Text);
    });

    firebase.database().ref("SubComment/" + snap.key).on('child_removed', snap2 => {
      $("#comment_block_"+snap2.key).remove();
    });
}

function changePostDisplay(routeParams){
    if(window.postListener){
        location.reload();
    }

    window.postListener = true;
  $("#course").text(routeParams.Course_ID);
  $("#course").attr('href', "/#!/course/" + routeParams.Course_ID);
  firebase.database().ref("Courses/" + routeParams.Course_ID).once('value').then(snap0 => {
    firebase.database().ref("Post/" + routeParams.Course_ID+ "/" + routeParams.Post_ID).once('value').then(snap => {
      $("#post").text(snap.val().Title);
      $("#title").text(snap.val().Title);
      $("#content").text(snap.val().Post_content);
      firebase.database().ref("Users/" + snap.val().User_ID).once('value').then(snap => {
        $("#author").text(snap.val().fullName);
        if (firebase.auth().currentUser.uid == snap.val().uid || firebase.auth().currentUser.uid == snap0.val().Admin) {
          $("#title_row").append("<p><div class='text-right'><a href='/#!/course/"+routeParams.Course_ID+"/edit/"+routeParams.Post_ID+"'class='btn btn-outline-warning'>Edit Post</a>"
            + " <a href='javascript:void(0)' class='btn btn-outline-danger' onClick='deletePost(\""+routeParams.Course_ID+"\", \""+routeParams.Post_ID+"\")'>Delete Post</a></div></p>");
        }
      });
      $("#time_created").text(new moment(snap.val().Timestamp).format('MMMM Do YYYY, h:mm a'));
    });
  });

  // Load Comments
  firebase.database().ref("Courses/"+routeParams.Course_ID).once("value").then(snapshot0 => {
    firebase.database().ref("Comment/" + routeParams.Post_ID).on('child_added', snap => {
      let edit_link = "";
      let delete_link = "</h6>";
      let comment_text = snap.val().Text;
      if (firebase.auth().currentUser.uid == snap.val().User_ID) {
        edit_link = " <a id='edit_link_"+snap.key+"' href='javascript:void(0)' style='color: red' onClick='displayEditCommentSection(\""+snap.key+"\", \""+routeParams.Post_ID+"\", true)'>Edit</a>";
        comment_text = "<div id='comment_text_"+snap.key+"'>"+snap.val().Text+"</div>";
      }
      if (firebase.auth().currentUser.uid == snap.val().User_ID || firebase.auth().currentUser.uid == snapshot0.val().Admin) {
        delete_link = " <a href='javascript:void(0)' style='color: red' onClick='deleteComment(\""+snap.key+"\", \""+routeParams.Post_ID+"\", true)'>Delete</a>";
      }

      let comment = "<li id='comment_block_"+snap.key+"' class='list-group-item'>"
        + "<h6><span class='" + snap.val().User_ID + "'></span><span style='color: grey'>:- " + new moment(snap.val().Timestamp).fromNow() + "</span>"
        +" <a href='javascript:void(0)' style='color: red' onClick='displaySubCommentSection(\""+snap.key+"\")'>Reply</a>"
        + edit_link
        + delete_link
        + "</h6>"
        + comment_text
        + "<div id='sub_"+snap.key+"' class='border rounded text-white' style='padding: 10px; display: none;'>"
        + "<p>Insert reply below:</p>"
        + "<div style='padding-bottom: 10px'><textarea id='sub_comment_content_"+snap.key+"' class='form-control' rows='2'></textarea></div>"
        + "<div><button type='button' class='btn btn-primary btn-sm' onClick='createSubComment(\""+snap.key+"\")'>Post Reply</button> "
        + "<button type='button' class='btn btn-basic btn-sm' onClick='cancelSubCommentSection(\""+snap.key+"\")'>Cancel</button></div>"
        + "</div>"
        + "<ul id='" + snap.key + "' class='list-group'></ul>"
        + "</li>";
      $("#commentList").prepend(comment);
      firebase.database().ref("Users/" + snap.val().User_ID).once('value').then(user => {
        $("." + snap.val().User_ID).text(user.val().fullName);
      });
      loadSubComment(snap, routeParams);
    });
  });

  //On changed is somehow called twice per edit, use consol.log() and things will be printed twice
  firebase.database().ref("Comment/" + routeParams.Post_ID).on('child_changed', snap => {
    $("#comment_text_"+snap.key).text(snap.val().Text);
  });

  firebase.database().ref("Comment/" + routeParams.Post_ID).on('child_removed', snap => {
    $("#comment_block_"+snap.key).remove();
  });
}

function deletePost (course_ID, parent_ID) {
  	let parent_ref_string = "Post/" + course_ID + "/" + parent_ID;
	window.alert(parent_ref_string);
	let postRef = firebase.database().ref(parent_ref_string);
	let commentRef = firebase.database().ref("Comment/" + parent_ID + "/");
	commentRef.once('value', snap => {
       snap.forEach(child => {
         deleteComment (child.key, parent_ID, true);
       });
    });
	postRef.remove();
	window.history.back();
}

function toggleSignOut(){
  firebase.auth().signOut();
  $(".authed").css("display","none");
  window.location.href = "/#!/";
}
