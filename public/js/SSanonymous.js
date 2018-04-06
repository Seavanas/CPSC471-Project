function createAnonPost($routeParams) {
  $("#anon-post_submit").on('click', function(){
    let title = $("#post_title").val();
    let content = $("#post_content").val();

    if(title.length > 4 && content.length > 0){
      let postRef = firebase.database().ref("/Anonymous/"+$routeParams.Course_ID);
      let key = postRef.push().key;
      console.log(key);
      postRef.child(key).set({
        Title: title,
        Post_content: content,
        User_ID: firebase.auth().currentUser.uid,
        Timestamp: firebase.database.ServerValue.TIMESTAMP
      });
      window.location.href = "/#!/course/" + $routeParams.Course_ID + "/Anonymous/" + key;
    }
  });
}

function getAnonCoursePostList(routeParams) {
  let post_ref = firebase.database().ref("Anonymous/" + routeParams.Course_ID);
  let post_list = [];

  post_ref.once("value", function(snapshot){
    snapshot.forEach(function(childSnapshot){
      let Post_ID = childSnapshot.key;
      let post_title = childSnapshot.val().Title;
      firebase.database().ref("Users/" + childSnapshot.val().User_ID).once('value').then(snap => {
        $("#anon-post_list").append("<a href='/#!/course/" + routeParams.Course_ID +"/Anonymous/"+ Post_ID + "' class='list-group-item'>"
          + "<h4>" + post_title + "</h4>"
          + "<i class='far fa-user'></i> <span> Anonymous </span>&nbsp;"
          + "<i class='far fa-clock'></i> <span>" + new moment(childSnapshot.val().Timestamp).fromNow() +"</span>"
          + "<p class='text-right'>View Details</p>"
          +"</a>");
      });

    })
  });
}

function changeAnonPostDisplay(routeParams){
  $("#course").text(routeParams.Course_ID);
  $("#course").attr('href', "/#!/course/" + routeParams.Course_ID);

  firebase.database().ref("Anonymous/" + routeParams.Course_ID+ "/" + routeParams.Post_ID).once('value').then(snap => {
    $("#post").text(snap.val().Title);
    $("#title").text(snap.val().Title);
    $("#content").text(snap.val().Post_content);
    firebase.database().ref("Users/" + snap.val().User_ID).once('value').then(snap => {
      $("#author").text("Anonymous");
    });
    $("#time_created").text(new moment(snap.val().Timestamp).fromNow());
  });

  // Load Comments
  firebase.database().ref("Comment/" + routeParams.Post_ID).on('child_added', snap => {
    firebase.database().ref("Users/" + snap.val().User_ID).once('value').then(user => {
      $("#commentList").append("<li class='list-group-item'>"
        + "<h6>" + user.val().fullName + "<span style='color: grey'>:- " + new moment(snap.val().Timestamp).fromNow() + "</span></h6>"
        + snap.val().Text
        + "<ul id='" + snap.key + "' class='list-group'></ul>"
        + "</li>");
      // Load SubComments Of Comment
      firebase.database().ref("SubComment/" + snap.key).on('child_added', snap2 => {
        firebase.database().ref("Users/" + snap2.val().User_ID).once('value').then(user2 => {
          $("#" + snap.key).append("<li class='list-group-item'>"
            + "<h6>" + user.val().fullName +  "<span style='color: grey'>:- " + new moment(snap2.val().Timestamp).fromNow() + "</span></h6>"
            + snap2.val().Text
            + "</li>");
        });
      });
    });
  });
}