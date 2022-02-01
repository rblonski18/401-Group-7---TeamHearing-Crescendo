<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		$query = $conn->prepare(
			"SELECT assignment FROM Homework WHERE subuser = ? ORDER BY ID DESC LIMIT 1 "
		);
		$query->bind_param('i',$_GET['subuser']);
		$query->execute();
		echo json_encode(get_result($query)); break;
	case "POST":
		$query = $conn->prepare(
			"INSERT INTO Homework (assignment,subuser,user) VALUES (?,?,?);"
		);
		$query->bind_param('sii',$_POST['assignment'],$_POST['subuser'],$_POST['user']);
		$query->execute();
		$query->close();
		echo json_encode($_POST['assignment']);
}
?>