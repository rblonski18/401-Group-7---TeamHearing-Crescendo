<?php
include_once 'utilities.php'; $conn = connect();
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		$query = $conn->prepare(
			"SELECT * FROM ILD WHERE subuser = ?"
		);
		$query->bind_param('i',$_GET['subuser']);
		$query->execute();
		$result = get_result($query);
		echo json_encode($result); break;
	case "POST":
		$ear = convert2ID('Ear','ear',$_POST['ear']);
		$query = $conn->prepare(
			"INSERT INTO ILD 
			(duration,ear,f0,f1,f1Left,f1Right,gainLeft,gainRight,notes,score,series,subuser,user) 
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"
		);
		$query->bind_param('diddddddsdsii',
			$_POST['duration'],
			$_POST['ear'],
			$_POST['f0'],
			$_POST['f1'],
			$_POST['f1Left'],
			$_POST['f1Right'],
			$_POST['gainLeft'],
			$_POST['gainRight'],
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