<?php 
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		// query
		$query = $conn->prepare(
			"SELECT P.*, 
				CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
				CONCAT(p2.firstname,' ',p2.lastname) AS superuser, 
				CONCAT(p3.firstname,' ',p3.lastname) AS user,
				p.permission AS permission
				FROM Permissions P 
				LEFT JOIN Profiles p1 on P.subuser = p1.ID 
				LEFT JOIN Profiles p2 on P.superuser = p2.ID 
				LEFT JOIN Profiles p3 on P.user = p3.ID
				LEFT JOIN Permission p on P.permission = p.ID 
				WHERE P.subuser = ?"
		);
		
		// bind query and execute
		$query->bind_param('i',$_GET['subuser']);
		$query->execute();
		echo json_encode(get_result($query)); break;
	case "POST":
		// query
		$query = $conn->prepare(
			"INSERT INTO Permissions 
			(permission,subuser,superuser,user) 
			VALUES (?,?,?,?)"
		);
		
		// convert to ID
		$permission = convert2ID('Permission','permission',$_POST['permission']);
		
		// bind and execute
		$query->bind_param('iiii',
			$permission,
			$_POST['subuser'],
			$_POST['superuser'],
			$_POST['user']
		);
		$query->execute();
		$query->close();
		
		// echo ID
		echo json_encode($conn->insert_id); break;
	case "PUT":
		$_PUT = array();
		parse_str(trim(file_get_contents('php://input')), $_PUT);
		
		// query
		$query = $conn->prepare(
			"UPDATE Permissions SET permission = ?, user = ? WHERE ID = ?"
		);
		
		// bind and execute
		$query->bind_param('iii',$_PUT['permission'],$_PUT['user'],$_PUT['ID']);
		$query->execute();
		$query->close(); break;
	case "DELETE"://this doesn't work	
		$_DELETE = array();
		parse_str(trim(file_get_contents('php://input')), $_DELETE);
		
		// query
		$query = $conn->prepare("DELETE FROM Permissions WHERE ID = ?");
		
		// bind and execute
		$query->bind_param('i',$_DELETE['ID']);
		$query->execute();
		$query->close();
}
?>