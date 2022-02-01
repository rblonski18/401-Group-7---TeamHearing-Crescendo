<?php
include_once 'utilities.php';
switch ($_SERVER['REQUEST_METHOD']) {
	case "GET":
		$query = $conn->prepare(
			"SELECT * FROM Protocol WHERE ear = ? AND protocol = ? AND subuser = ? && entry >= NOW() - INTERVAL 1 DAY ORDER BY ID desc LIMIT 1"
		);
		$query->bind_param('isi',
			$_GET['ear'],
			$_GET['protocol'],
			$_GET['subuser']
		);
		$query->execute();
		echo json_encode(get_result($query));
		break;
	case "POST":
		$query = $conn->prepare(
			"INSERT INTO Protocol (activity,ear,elapsedTime,IDs,ind,isComplete,protocol,settings,subuser,testOrder,user,webVersion) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)"
		);
		$query->bind_param('siisiissisis',
			$_POST['activity'],
			$_POST['ear'],
			$_POST['elapsedTime'],
			$_POST['IDs'],
			$_POST['ind'],
			$_POST['isComplete'],
			$_POST['protocol'],
			$_POST['settings'],
			$_POST['subuser'],
			$_POST['testOrder'],
			$_POST['user'],
			$_POST['webVersion']
		);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id);
		break;
	case "PUT":
		parse_str(file_get_contents("php://input"),$_PUT);
		$query = $conn->prepare(
			"UPDATE Protocol SET IDs=?,ear=?,elapsedTime=?,ind=?,isComplete=? WHERE ID = ?"
		);
		$query->bind_param('siiiii',
			$_PUT['IDs'],
			$_PUT['ear'],
			$_PUT['elapsedTime'],
			$_PUT['ind'],
			$_PUT['isComplete'],
			$_PUT['ID']
		);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id);
}
?>
