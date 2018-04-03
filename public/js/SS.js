function SStest() {
  firebase.database().ref("Users/user1").once("value").then(function(snapshot){
    let addr = snapshot.val().address;
    $("#p1").text(addr);
    console.log(addr);
  })
}

function createPost() {
  let post_title = $("#post_title").val();
  let post_content = $("#post_content").val();
  let post_ref = firebase.database().ref("Post");

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
    time_posted: firebase.database.ServerValue.TIMESTAMP,
    User_ID: firebase.auth().currentUser.uid
  });

  $("#p1").text(post_content);
  console.log(post_content);
}

function getCoursePostList(routeParams) {
  let post_ref = firebase.database().ref("Post");
  let post_list = [];
  let Course_ID = routeParams.Course_ID;

  console.log(Course_ID);

  post_ref.once("value", function(snapshot){
    snapshot.forEach(function(childSnapshot){
      let Post_ID = childSnapshot.key;
      if (Post_ID != 'Post_count' && childSnapshot.val().Course_ID.localeCompare(Course_ID) == 0)
      {
        let post_title = childSnapshot.val().Title;
        $("#post_list").append("<a href=\"#!/post/"+Post_ID+"\" class=\"list-group-item\">"+post_title+"</a>");
        console.log(Post_ID);
      }
    })
  });
}
