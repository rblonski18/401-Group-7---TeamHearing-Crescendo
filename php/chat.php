<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		$query = $conn->prepare("SELECT * FROM Chat WHERE ID > ?");
		$condition = $_GET['lastID'];
		$query->bind_param('i', $condition);
		$query->execute();
		$result = get_result($query);
		echo json_encode($result); break;
	case "POST":
		$query = $conn->prepare("INSERT INTO Chat (message,user) VALUES (?,?)");
		$query->bind_param('ss',$_POST['message'],$_POST['user']);
		$query->execute();
		$query->close();
}
?>