function SStest() {
  firebase.database().ref("Users/user1").once("value").then(function(snapshot){
    let addr = snapshot.val().address;
    $("#p1").text(addr);
    console.log(addr);
  })
}

function createPost($routeParams) {
  $("#post_submit").on('click', function(){
    let title = $("#post_title").val();
    let content = $("#post_content").val();

    if(title.length > 4 && content.length > 0){
      let postRef = firebase.database().ref("/Post/"+$routeParams.Course_ID);
      let key = postRef.push().key;
      console.log(key);
      postRef.child(key).set({
        Title: title,
        Post_content: content,
        User_ID: firebase.auth().currentUser.uid,
        Timestamp: firebase.database.ServerValue.TIMESTAMP
      });
      window.location.href = "/#!/course/" + $routeParams.Course_ID + "/post/" + key;
    }
  });
}

function getCoursePostList(routeParams) {
  let post_ref = firebase.database().ref("Post/" + routeParams.Course_ID);
  let post_list = [];

  post_ref.once("value", function(snapshot){
    snapshot.forEach(function(childSnapshot){
      let Post_ID = childSnapshot.key;
      let post_title = childSnapshot.val().Title;
      firebase.database().ref("Users/" + childSnapshot.val().User_ID).once('value').then(snap => {
        $("#post_list").append("<a href='/#!/course/" + routeParams.Course_ID +"/post/"+ Post_ID + "' class='list-group-item'>"
          + "<h4>" + post_title + "</h4>"
          + "<i class='far fa-user'></i> <span>" + snap.val().fullName +"</span>&nbsp;"
          + "<i class='far fa-clock'></i> <span>" + new moment(childSnapshot.val().Timestamp).fromNow() +"</span>"
          + "<p class='text-right'>View Details</p>"
          +"</a>");
      });

    })
  });
}

function getCourseNotifcationList(routeParams) {
  let post_ref = firebase.database().ref("Notification/" + routeParams.Course_ID);
  let post_list = [];

  post_ref.limitToLast(3).once("value", function(snapshot){
    snapshot.forEach(function(childSnapshot){
      let Post_ID = childSnapshot.key;
      let post_title = childSnapshot.val().Title;
      firebase.database().ref("Users/" + childSnapshot.val().User_ID).once('value').then(snap => {
        $("#notifications_list").append("<li class='list-group-item'>"
          + "<h6>" + childSnapshot.val().Text + "</h6>"
          + "<i class='far fa-user'></i> <span>" + snap.val().fullName +"</span>&nbsp;"
          + "<i class='far fa-clock'></i> <span>" + new moment(childSnapshot.val().Timestamp).fromNow() +"</span>"
          +"</li>");
      });

    })
  });
}

function createNotification($routeParams){
  $("#timepicker").pickatime();
  $("#datepicker").pickadate();
  $("#note_submit").on('click', function(){
    let time = $("#timepicker").pickatime('picker').get('select').pick;
    let date = + $("#datepicker").pickadate('picker').get('select').pick;
    let timeStamp = time + date;
    let message = $("#message").val();
    if(time > 0 && date > 0 && message.length > 5){
      console.log("pushed");
      firebase.database().ref("/Notification/" + $routeParams.Course_ID).push().set({
        Text: message,
        Timestamp: timeStamp,
        User_ID: firebase.auth().currentUser.uid
      });
      window.location.href = "/#!/course/" + $routeParams.Course_ID;
    }
  });
}
