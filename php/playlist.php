<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	// tell frontend if the user logged in on another day
	case "GET":
		$query = $conn->prepare("SELECT (day,ind) FROM playlist WHERE user = ?");
		$condition = $_GET['user'];
		$query->bind_param('i', $condition);
		$query->execute();
		// dne = does not exist
		if($conn->affected_rows==0){echo json_encode("dne");return;}
		$prevDay = get_result($query);
		$currDay = date("Y-m-d");
		$result = (strcmp($prevDay, $currDay) == 0) ? 'same' : 'diff';
		echo json_encode($result); break;
	// log the current day
	case "POST":
		// have to do day here because MySQL doesn't support CURRENT_DATE as default value in the table
		$query = $conn->prepare("INSERT INTO playlist (day,user,ind) VALUES (?,?,?)");
		$query->bind_param('sss',date("Y-m-d"),$_POST['user'],$_POST['ind']);
		$query->execute();
		$query->close();
		break;
	case "PUT":
		// if it's a new day, update date to the current date
		if (strcmp($_POST['newDay'], 'yes') == 0) {
			$query = $conn->prepare("UPDATE playlist SET (day=?,ind=?) WHERE user = ?");
			$query->bind_param('sss',date("Y-m-d"),$_PUT['ind'],$_PUT['user']);
			$query->execute();
			$query->close();
		// else, just update the indices
		} else {
			$query = $conn->prepare("UPDATE playlist SET (ind=?) WHERE user = ?");
			$query->bind_param($_PUT['ind'],$_PUT['user']);
			$query->execute();
			$query->close();
		}
		$query = $conn->prepare("UPDATE LastVisit SET (ind=?) WHERE ")
		break;
}
?>