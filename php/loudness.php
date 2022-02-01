<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		$query = $conn->prepare(
			"SELECT loudness FROM Loudness WHERE subuser = ? ORDER BY ID DESC LIMIT 1"
		);
		$query->bind_param('i',$_GET['subuser']);
		$query->execute();
		$result = get_result($query);
		echo json_encode($result); break;
	case "POST":
		$query = $conn->prepare(
			"INSERT INTO Loudness (loudness,subuser,user) VALUES (?,?,?)"
		);
		$query->bind_param('sii',
			$_POST['loudness'],
			$_POST['subuser'],
			$_POST['user']
		);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id);
}
?>