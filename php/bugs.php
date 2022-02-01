<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		$query = $conn->prepare("SELECT * FROM Bugs WHERE entry > NOW() - INTERVAL 10 DAY");
		$query->execute();
		$result = get_result($query);
		echo json_encode($result); break;
	case "POST":
		$query = $conn->prepare("INSERT INTO Bugs (browser,bug,iOS,samplerate,user) VALUES (?,?,?,?,?)");
		$query->bind_param('ssiii',$_POST['browser'],$_POST['bug'],$_POST['iOS'],$_POST['samplerate'],$_POST['user']);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id);
}
?>
