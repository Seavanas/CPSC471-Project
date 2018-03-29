function SStest() {
  firebase.database().ref("Users/user1").once("value").then(function(snapshot){
    let addr = snapshot.val().address;
    $("#p1").text(addr);
    console.log(addr);
  })
}

function createPost() {
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
    Title: 'Lecture1',
    Post_content: post_content,
    'Date': '0230',
    User_ID: '0123456789'
  });

  $("#p1").text(post_content);
  console.log(post_content);
}

function getCoursePostList() {
  let post_ref = firebase.database().ref("Post");
  let post_list = [];

  post_ref.once("value", function(snapshot){
    snapshot.forEach(function(childSnapshot){
      if (childSnapshot.key != 'Post_count')
      {
        console.log(childSnapshot.key);
      }
    })
  });
}
