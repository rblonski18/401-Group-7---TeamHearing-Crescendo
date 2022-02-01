<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		$query = $conn->prepare(
			"SELECT SHS.*,
			CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
			CONCAT(p2.firstname,' ',p2.lastname) AS user
			FROM SHS 
			INNER JOIN Profiles p1 on SHS.subuser = p1.ID 
			INNER JOIN Profiles p2 on SHS.user = p2.ID 
			WHERE subuser = ?"
		);
		$query->bind_param('i',$_GET['subuser']);
		$query->execute();
		echo json_encode(get_result($query)); break;
	case "POST":	
		$query = $conn->prepare(
			"INSERT INTO SHS (categoryID, groupID, correct, total, subuser, user) 
			VALUES (?,?,?,?,?,?)"
		);
		$query->bind_param('iiiiii',
			$_POST['category'],
			$_POST['group'],
			$_POST['correct'],
			$_POST['total'],
			$_POST['subuser'],
			$_POST['user']
		);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id);
		
		// post to Activity
		postToActivity('SHS',$_POST['subuser'],$_POST['user']);
}
?>