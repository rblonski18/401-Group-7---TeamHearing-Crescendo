<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "POST":
		$query = $conn->prepare("INSERT INTO Files (filename,subuser,user) VALUES (?,?,?)");
		$query->bind_param('sii', $_POST['filename'], $_POST['subuser'], $_POST['user']);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id); break;
	case "GET":
		$query = $conn->prepare("SELECT * FROM Files WHERE subuser = ?");
		$query->bind_param('i',$_GET['subuser']);
		$query->execute();
		echo json_encode(get_result($query));
}
?>