<?php
include_once 'connection.php';
include_once 'utilities.php';
$conn = connect();
switch ($_SERVER['REQUEST_METHOD']) {
	case "POST":
		$adaptive = $_POST['adaptive'];
		$ear = $_POST['ear'];
		$notes = $_POST['notes'];
		$score = $_POST['score'];
		$series = $_POST['series'];
		$subuser = $_POST['subuser'];
		$user = $_POST['user'];
		
		// convert to ID
		$ear = convert2ID('Ear','ear',$ear);
		
		// post
		$query = $conn->prepare(
			"INSERT INTO Voice (adaptive,ear,notes,score,series,subuser,user) 
			VALUES ('$adaptive','$ear','$notes','$score','$series','$subuser','$user')"
		);
		$query->execute(); break;
	case "GET":
		$password = $_GET['password'];
		$subuser = $_GET['subuser'];
		$user = $_GET['user'];
		
		//
		$query = $conn->prepare(
			"SELECT Voice.*,
			CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
			CONCAT(p2.firstname,' ',p2.lastname) AS user
			FROM Voice
			INNER JOIN Profiles p1 on Voice.subuser = p1.ID 
			INNER JOIN Profiles p2 on Voice.user = p2.ID 
			WHERE subuser = ?"
		);
		$query->bind_param('i',$subuser);
		$query->execute();
		$result = get_result($query);
		echo json_encode($result);
}
?>