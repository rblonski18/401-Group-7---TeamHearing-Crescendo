<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		$query = $conn->prepare(
			"SELECT Audiogram.*,
			CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
			CONCAT(p2.firstname,' ',p2.lastname) AS user
			FROM Audiogram 
			INNER JOIN Profiles p1 on Audiogram.subuser = p1.ID 
			INNER JOIN Profiles p2 on Audiogram.user = p2.ID 
			WHERE subuser = ?"
		);
		$query->bind_param('i',$_GET['subuser']);
		$query->execute();
		echo json_encode(get_result($query)); break;
	case "POST":		
		//
		$query = $conn->prepare(
			"INSERT INTO Audiogram (L125,L250,L500,L1000,L2000,L4000,L8000,L16000,R125,R250,R500,R1000,R2000,R4000,R8000,R16000,subuser,user) 
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
		);
		$query->bind_param('ddddddddddddddddii',
			$_POST['L125'],
			$_POST['L250'],
			$_POST['L500'],
			$_POST['L1000'],
			$_POST['L2000'],
			$_POST['L4000'],
			$_POST['L8000'],
			$_POST['L16000'],
			$_POST['R125'],
			$_POST['R250'],
			$_POST['R500'],
			$_POST['R1000'],
			$_POST['R2000'],
			$_POST['R4000'],
			$_POST['R8000'],
			$_POST['R16000'],
			$_POST['subuser'],
			$_POST['user']
		);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id);
		
		// post to Activity
		postToActivity('Audiogram',$_POST['subuser'],$_POST['user']);
}
?>