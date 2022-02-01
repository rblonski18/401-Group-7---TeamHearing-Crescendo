<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		$query = $conn->prepare(
			"SELECT Notes.*,
				CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
				CONCAT(p2.firstname,' ',p2.lastname) AS user 
				FROM Notes 
				INNER JOIN Profiles p1 on Notes.subuser = p1.ID 
				INNER JOIN Profiles p2 on Notes.user = p2.ID 
				WHERE subuser = ?"
		);
		$query->bind_param('i',$_GET['subuser']);
		$query->execute();
		echo json_encode(get_result($query)); break;
	case "POST":
		$query = $conn->prepare(
			"INSERT INTO Notes (note, title, subuser, user) 
			VALUES (?,?,?,?)"
		);
		$query->bind_param('ssii',
			$_POST['note'],
			$_POST['title'],
			$_POST['subuser'],
			$_POST['user']
		);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id); break;
	case "PUT":
		parse_str(file_get_contents("php://input"),$_PUT);
		
		$query = $conn->prepare(
			"UPDATE Notes SET note=?, title=?
			WHERE ID = ?"
		);
		$query->bind_param('ssi',
			$_PUT['note'],
			$_PUT['title'],
			$_PUT['ID']
		);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id); break;
	case "DELETE":
		parse_str(file_get_contents("php://input"),$_DELETE);
		
		$query = $conn->prepare("DELETE FROM Notes WHERE ID = ?");
		$query->bind_param('i',$_DELETE['ID']);
		$query->execute();
		echo json_encode($query->affected_rows);
		$query->close();
}
?>