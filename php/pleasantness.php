<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		// form query
		$query = $conn->prepare(
			"SELECT Pleasantness.*,
			CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
			CONCAT(p2.firstname,' ',p2.lastname) AS user
			FROM Pleasantness 
			INNER JOIN Profiles p1 on Pleasantness.subuser = p1.ID 
			INNER JOIN Profiles p2 on Pleasantness.user = p2.ID 
			WHERE subuser = ?"
		);
		
		// bind query and execute
		$query->bind_param('i',$_GET['subuser']);
		$query->execute();
		
		// get result
		$result = get_result($query);
		
		// tell the world
		echo json_encode($result); break;
	case "POST":
		// convert to ID
		$ear = convert2ID('Ear','ear',$_POST['ear']);
		
		// form query
		$query = $conn->prepare(
			"INSERT INTO Pleasantness (ear,gain,intervals,notes,practice,responses,roots,subuser,user) VALUES (?,?,?,?,?,?,?,?,?)"
		);
		
		// bind query and execute
		$query->bind_param('idssissii',
			$ear,
			$_POST['gain'],
			$_POST['intervals'],
			$_POST['notes'],
			$_POST['practice'],
			$_POST['responses'],
			$_POST['roots'],
			$_POST['subuser'],
			$_POST['user']
		);
		$query->execute();
		$query->close();
		
		//
		echo json_encode($conn->insert_id);
		
		// post to Activity
		postToActivity('Pleasantness',$_POST['subuser'],$_POST['user']);
}
?>