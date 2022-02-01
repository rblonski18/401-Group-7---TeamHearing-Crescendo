<?php
include_once 'utilities.php'; $conn = connect();
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		$query = $conn->prepare(
			"SELECT username FROM Profiles WHERE ID = ?"
		);
		$query->bind_param('s',$_GET['subuser']);
		$query->execute();
		echo json_encode(get_result($query)); break;
	case "POST":
		$query = $conn->prepare(
			"INSERT INTO GoNogo (
				nums,rt,accuracy,condition_gonogo,shapeshown,subuser,user
			)
			VALUES (?,?,?,?,?,?,?)"
		);
		$query->bind_param('sssssss',
			$_POST['nums'],
			$_POST['rt'],
			$_POST['accuracy'],
			$_POST['condition_gonogo'],
			$_POST['shapeshown'],
			$_POST['subuser'],
			$_POST['user']
		);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id);

		// post to Activity
		// Activities = list of the tasks and their ID #
		// Activity = list of user activity - entry time, what task they completed
		$activity = convert2ID('Activities','activity','GoNogo');
		$query = $conn->prepare(
			"INSERT INTO Activity (activity,subuser,user) VALUES (?,?,?)"
		);
		$query->bind_param('iii',$activity,$_POST['subuser'],$_POST['user']);
		$query->execute();
		$query->close();
}
?>
