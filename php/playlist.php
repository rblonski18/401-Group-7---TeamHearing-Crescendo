<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	// tell frontend if it's same day or different day
	case "GET":
		$query = $conn->prepare("SELECT (entry) FROM playlist WHERE user = ? AND subuser=? AND difficulty=? AND mode=?");
		$query->bind_param(
			'iiss', 
			$_GET['user'], 
			$_GET['subuser'], 
			$_GET['difficulty'], 
			$_GET['mode']
		);
		$query->execute();
		// dne = does not exist
		if($conn->affected_rows==0){echo json_encode("dne");return;}
		$prevDay = get_result($query);
		$currDay = date("Y-m-d");
		$result = (strcmp($prevDay, $currDay) == 0) ? 'same' : 'diff';
		echo json_encode($result); break;
	// log the current day
	case "POST":
		// README: (user,subuser,difficulty,mode) column must be declared UNIQUE in SQL or else this will not work properly!
		$query = $conn->prepare("INSERT INTO playlist (entry,subuser,user,indices,difficulty,mode) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE entry=?,indices=?");
		$currDay = date("Y-m-d");
		$query->bind_param(
			'siisssss',
			$currDay,
			$_POST['user'],
			$_POST['subuser'],
			$_POST['indices'],
			$_POST['difficulty'],
			$_POST['mode'],
			$currDay,
			$_POST['indices']
		);
		$query->execute();
		$query->close();
		break;
}
?>