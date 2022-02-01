<?php
include_once 'utilities.php';
switch ($_SERVER['REQUEST_METHOD']) {
	case "GET":		
		$query = $conn->prepare(
			"SELECT MajorMinor.*,
			CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
			CONCAT(p2.firstname,' ',p2.lastname) AS user
			FROM MajorMinor 
			INNER JOIN Profiles p1 on MajorMinor.subuser = p1.ID 
			INNER JOIN Profiles p2 on MajorMinor.user = p2.ID 
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
		
		// post to MajorMinor
		$query = $conn->prepare(
			"INSERT INTO MajorMinor (calls,ear,gain,mode,notes,practice,responses,roots,score,stimulusMode,subuser,user) 
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?)"
		);
		$query->bind_param('sidisissdiii',
			$_POST['calls'],
			$ear,
			$_POST['gain'],
			$_POST['mode'],
			$_POST['notes'],
			$_POST['practice'],
			$_POST['responses'],
			$_POST['roots'],
			$_POST['score'],
			$_POST['stimulusMode'],
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