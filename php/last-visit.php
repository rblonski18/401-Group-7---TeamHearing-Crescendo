<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	// tell frontend if the user logged in on another day
	case "GET":
		$query = $conn->prepare("SELECT date FROM LastVist WHERE user = ?");
		$condition = $_GET['user'];
		$query->bind_param('i', $condition);
		$query->execute();
		// dne = does not exist
		if($conn->affected_rows==0){echo json_encode("dne");return;}
		$prevDate = get_result($query);
		$currDate = date("Y-m-d");
		$result = (strcmp($prevDate, $currDate) == 0) ? 'same' : 'different';
		echo json_encode($result); break;
	// log the current date
	case "POST":
		// have to do date here because MySQL doesn't support CURRENT_DATE as default value in the table
		$query = $conn->prepare("INSERT INTO LastVisit (date,user) VALUES (?,?)");
		$query->bind_param('ss',date("Y-m-d"),$_POST['user']);
		$query->execute();
		$query->close();
		break;
	case "DELETE":
		// remove indices from the table
		$query = $conn->prepare("DELETE FROM LastVisit WHERE user = ?");
		$query->bind_param('i',$_DELETE['user']);
		$query->execute();
		$query->close();
}
?>