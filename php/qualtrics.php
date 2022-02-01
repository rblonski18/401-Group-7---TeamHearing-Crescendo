<?php
include_once 'utilities.php';
switch ($_SERVER['REQUEST_METHOD']) {
	case "GET":		
		$query = $conn->prepare(
			"SELECT Qualtrics.*,
			CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
			CONCAT(p2.firstname,' ',p2.lastname) AS user
			FROM Qualtrics 
			INNER JOIN Profiles p1 on Qualtrics.subuser = p1.ID 
			INNER JOIN Profiles p2 on Qualtrics.user = p2.ID 
			WHERE subuser = ?"
		);
		$query->bind_param('i',$_GET['subuser']);
		$query->execute();
		$result = get_result($query);
		echo json_encode($result); 
		break;
	case "POST":
		// convert to ID
		$ear = convert2ID('Ear','ear',$_POST['ear']);
		
		// post to Qualtrics
		$query = $conn->prepare(
			"INSERT INTO Qualtrics (calls,ear,gain,mode,notes,practice,responses,roots,subuser,user) 
			VALUES (?,?,?,?,?,?,?,?,?,?)"
		);
		$query->bind_param('sidisissii',
			$_POST['calls'],
			$ear,
			$_POST['gain'],
			$_POST['mode'],
			$_POST['notes'],
			$_POST['practice'],
			$_POST['responses'],
			$_POST['roots'],
			$_POST['subuser'],
			$_POST['user']
		);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id);
		
		// post to Activity
		postToActivity('CRISP',$_POST['subuser'],$_POST['user']);
}
?>