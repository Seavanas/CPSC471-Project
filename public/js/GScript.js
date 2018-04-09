function createCourse() {
  $("#submit_course").on('click', function(){
    let name = $("#course_name").val();
    let semester = $("#course_semester").val();
    let year = $("#course_year").val();
    if(name.length > 0 && semester.length > 0 && year.length > 0){
      let storageLocation = firebase.database().ref("Courses");
      let newCourse = storageLocation.push().key;
      console.log(newCourse);
      storageLocation.child(newCourse).set({
        Admin: firebase.auth().currentUser.uid,
        Name: name,
        Semester: semester,
        Year: year
      });
      window.location.href = "/#!/home";
    }
  });
}
