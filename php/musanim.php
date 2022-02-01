<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":		
		$query = $conn->prepare(
			"SELECT MCI.*,
			CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
			CONCAT(p2.firstname,' ',p2.lastname) AS user
			FROM MCI 
			INNER JOIN Profiles p1 on MCI.subuser = p1.ID 
			INNER JOIN Profiles p2 on MCI.user = p2.ID 
			WHERE subuser = ?"
		);
		$query->bind_param('i',$_GET['subuser']);
		$query->execute();
		$result = get_result($query);
		echo json_encode($result); break;
	case "POST":
		// inputs
		$calls = $_POST['calls'];
		$duration = $_POST['duration'];
		$ear = $_POST['ear'];
		$frequency = $_POST['frequency'];
		$notes = $_POST['notes'];
		$responses = $_POST['responses'];
		$score = $_POST['score'];
		$series = $_POST['series'];
		$spacing = $_POST['spacing'];
		$spacings = $_POST['spacings'];
		$subuser = $_POST['subuser'];
		$user = $_POST['user'];
		
		// convert to ID
		$ear = convert2ID('Ear','ear',$ear);
		
		// post to MCI
		$query = $conn->prepare(
			"INSERT INTO MCI (calls,duration,ear,frequency,notes,
				responses,score,series,spacing,spacings,
				subuser,user) 
			VALUES ('$calls','$duration','$ear','$frequency','$notes',
				'$responses','$score','$series','$spacing','$spacings',
				'$subuser','$user')"
		);
		$query->execute();
		echo json_encode($conn->insert_id);
		
		// post to Activity
		postToActivity('MCI',$_POST['subuser'],$_POST['user']);
}
?>