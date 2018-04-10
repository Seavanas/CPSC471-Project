function createCourse() {
  $("#submit_course").on('click', function(){
    let code = $("#course_code").val();
    let number = $("#course_number").val();
    let description = $("#course_description").val();
    let semester = $("#course_semester").val();
    let year = $("#course_year").val();
    if(code.length > 0 && number.length > 0 && description.length > 0 && semester.length > 0 && year.length > 0){
      let storageLocation = firebase.database().ref("Courses/" + code+"_"+number);
      storageLocation.once("value").then(function(snapshot){
      console.log(snapshot.val());
        if(snapshot.val()){
          errorMessage = "Course has already been registered";
          $("#userError").css("visibility", "visible");
          $("#userError").text(errorMessage);
        }
        else{
          storageLocation.set({
            Admin: firebase.auth().currentUser.uid,
            Name: (code+" "+number+" "+ description),
            Semester: semester,
            Year: year
          });
        }
      });
    }
  });
}




function editPost(routeParams){
  console.log(routeParams);
  let postRef = firebase.database().ref("/Post/"+routeParams.Course_ID+"/"+routeParams.Post_ID);
  postRef.once("value").then(function(snapshot) {
    $("#post_title").val(snapshot.val().Title);
    $("#post_content").val(snapshot.val().Post_content);
  });

  $('#edit_post').on('click', function() {
    postRef.set({
      Post_content: $("#post_content").val(),
      Timestamp: firebase.database.ServerValue.TIMESTAMP,
      Title: $("#post_title").val(),
      User_ID: firebase.auth().currentUser.uid
    });
    console.log(routeParams);
    window.location.href = "/#!/course/"+routeParams.Course_ID+"/post/"+routeParams.Post_ID;
  })
}
