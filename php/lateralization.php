<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		$query = $conn->prepare(
			"SELECT * FROM Lateralization WHERE subuser = ?"
		);
		$query->bind_param('i',$_GET['subuser']);
		$query->execute();
		$result = get_result($query);
		echo json_encode($result); break;
	case "POST":
		$ear = convert2ID('Ear','ear',$_POST['ear']);
		$query = $conn->prepare(
			"INSERT INTO Lateralization (ear,notes,score,series,subuser,user) 
			VALUES (?,?,?,?,?,?)"
		);
		$query->bind_param('isdsii',
			$ear,
			$_POST['notes'],
			$_POST['score'],
			$_POST['series'],
			$_POST['subuser'],
			$_POST['user']
		);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id);
}
?>