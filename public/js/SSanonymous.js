function createAnonPost() {
  let post_title = $("#post_title").val();
  let post_content = $("#post_content").val();
  let post_ref = firebase.database().ref("Anonymous");

  post_ref.once("value").then(function(snapshot){
    let post_count = snapshot.val().Post_count;

    post_count++;
    post_ref.update({
      Post_count: post_count
    });
  });

  post_ref.push().set({
    Title: post_title,
    Post_content: post_content,
    Timestamp: firebase.database.ServerValue.TIMESTAMP,
    User_ID: firebase.auth().currentUser.uid
  });

  $("#p1").text(post_content);
  console.log(post_content);
}

function getAnonCoursePostList(routeParams) {
  let post_ref = firebase.database().ref("Anonymous/" + routeParams.Course_ID);
  let post_list = [];

  post_ref.once("value", function(snapshot){
    snapshot.forEach(function(childSnapshot){
      let Post_ID = childSnapshot.key;
      let post_title = childSnapshot.val().Title;
      firebase.database().ref("Users/" + childSnapshot.val().User_ID).once('value').then(snap => {
        $("#anon-post_list").append("<a href='/#!/course/" + routeParams.Course_ID +"/post/"+ Post_ID + "' class='list-group-item'>"
          + "<h4>" + post_title + "</h4>"
          + "<i class='far fa-user'></i> <span> Anonymous </span>&nbsp;"
          + "<i class='far fa-clock'></i> <span>" + new moment(childSnapshot.val().Timestamp).fromNow() +"</span>"
          + "<p class='text-right'>View Details</p>"
          +"</a>");
      });

    })
  });
}