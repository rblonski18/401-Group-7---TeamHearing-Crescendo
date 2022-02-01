<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		$query = $conn->prepare(
			"SELECT Pitch.*,
			CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
			CONCAT(p2.firstname,' ',p2.lastname) AS user
			FROM Pitch 
			INNER JOIN Profiles p1 on Pitch.subuser = p1.ID 
			INNER JOIN Profiles p2 on Pitch.user = p2.ID 
			WHERE subuser = ?"
		);
		$query->bind_param('i',$_GET['subuser']);
		$query->execute();
		$result = get_result($query);
		echo json_encode($result); break;
	case "POST":
		// convert to ID
		$ear = convert2ID('Ear','ear',$_POST['ear']);
		
		// post to Pitch
		$query = $conn->prepare(
			"INSERT INTO Pitch (calls,ear,gain,instruments,mode,notes,practice,responses,roots,score,subuser,user) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)"
		);
		$query->bind_param('sidsisissdii',
			$_POST['calls'],
			$ear,
			$_POST['gain'],
			$_POST['instruments'],
			$_POST['mode'],
			$_POST['notes'],
			$_POST['practice'],
			$_POST['responses'],
			$_POST['roots'],
			$_POST['score'],
			$_POST['subuser'],
			$_POST['user']
		);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id);
		
		// post to Activity
		$activity = convert2ID('Activities','activity','Pitch');
		$query = $conn->prepare("INSERT INTO Activity (activity,subuser,user) VALUES (?,?,?)");
		$query->bind_param('iii',$activity,$_POST['subuser'],$_POST['user']);
		$query->execute();
		$query->close();
}
?>