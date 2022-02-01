<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		$query = $conn->prepare("SELECT * FROM Confronto WHERE subuser = ?");
		$query->bind_param('i',$_GET['subuser']);
		$query->execute();
		$result = get_result($query);
		echo json_encode($result); break;
	case "POST":
		$ear = convert2ID('Ear','ear',$_POST['ear']);
		$query = $conn->prepare(
			"INSERT INTO Confronto (
				behavior,calls,ear,files,noise,notes,practice,
				responses,score,series,snr,subuser,user
			) 
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"
		);
		$query->bind_param('isisisisdsdii',
			$_POST['behavior'],
			$_POST['calls'],
			$ear,
			$_POST['files'],
			$_POST['noise'],
			$_POST['notes'],
			$_POST['practice'],
			$_POST['responses'],
			$_POST['score'],
			$_POST['series'],
			$_POST['snr'],
			$_POST['subuser'],
			$_POST['user']
		);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id);
		
		// post to Activity
		postToActivity('Confronto',$_POST['subuser'],$_POST['user']);
}
?>