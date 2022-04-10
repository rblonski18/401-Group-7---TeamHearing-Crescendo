<?php
include_once 'utilities.php';

// doesn't need GET request because you can just GET request last-visit.php to know
// whether it's a new day or not
switch($_SERVER['REQUEST_METHOD']){
	case "POST":
		// insert indices into table
		$query = $conn->prepare("INSERT INTO Indices (index,user) VALUES (?,?)");
		// hopefully POST[indices] is an array when read? needs testing...
		foreach ($_POST['indices'] as &$index) {
			$query->bind_param('ss',$index,$_POST['user']);
			$query->execute();
		}
		$query->close();
		break;
	case "DELETE":
		// remove indices from the table
		$query = $conn->prepare("DELETE FROM Indices WHERE user = ?");
		$query->bind_param('i',$_DELETE['user']);
		$query->execute();
		$query->close();
		break;
}
?>