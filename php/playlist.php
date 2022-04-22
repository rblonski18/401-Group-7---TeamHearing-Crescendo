<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	// tell frontend if it's same day or different day
	case "GET":
		$query = $conn->prepare("SELECT (entry) FROM playlist WHERE user = ?");
		$query->bind_param('i', $_GET['user']);
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
		$query = $conn->prepare("INSERT INTO playlist (entry,user,indices) VALUES (?,?,?)");
		$query->bind_param('sss',date("Y-m-d"),$_POST['user'],$_POST['indices']);
		$query->execute();
		$query->close();
		break;
	case "PUT":
		// using 'newDay' as a flag to determine whether to also update date or not
		// if frontend says it's a new day, update date to the current day
		if (strcmp($_POST['newDay'], 'yes') == 0) {
			$query = $conn->prepare("UPDATE playlist SET (entry=?,indices=?) WHERE user = ?");
			$query->bind_param('sss',date("Y-m-d"),$_PUT['indices'],$_PUT['user']);
			$query->execute();
			$query->close();
		// else, just update the indices
		} else {
			$query = $conn->prepare("UPDATE playlist SET (indices=?) WHERE user = ?");
			$query->bind_param($_PUT['indices'],$_PUT['user']);
			$query->execute();
			$query->close();
		}
		break;
}
?>