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

function getCoursePostList() {
  let post_ref = firebase.database().ref("Post");
  let post_list = [];

  post_ref.once("value", function(snapshot){
    snapshot.forEach(function(childSnapshot){
      let post_key = childSnapshot.key;
      if (post_key != 'Post_count')
      {
        let post_title = childSnapshot.val().Title;
        $("#post_list").append("<a href=\"#\" class=\"list-group-item\">"+post_title+"</a>");
        console.log(post_key);
      }
    })
  });
}
