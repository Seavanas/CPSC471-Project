function getCourse(){
	let course = firebase.database().ref().child("Courses");
	course.on("child_added", snap => {

		var course = snap.child("Name").val();
		var semester = snap.child("Semester").val();
		var year = snap.child("Year").val();

		$("#Courses").append("<a href='#!/course/"+snap.key+"' class='list-group-item'>" + course + ": " + semester + " " + year + "</a>");
	});
}
