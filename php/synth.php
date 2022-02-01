<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		$query = $conn->prepare("SELECT * FROM Synth WHERE subuser = ?");
		$query->bind_param('i',$_GET['subuser']);
		$query->execute();
		$result = get_result($query);
		echo json_encode($result); break;
	case "POST":
		$ear = convert2ID('Ear','ear',$_POST['ear']);
		$query = $conn->prepare(
			"INSERT INTO Synth (adaptive,calls,condition,duration,ear,f0,gain,mode,notes,responses,score,series,subuser,user) 
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
		);
		$query->bind_param('dsididdissdsii',
			$_POST['adaptive'],
			$_POST['calls'],
			$_POST['condition'],
			$_POST['duration'],
			$ear,
			$_POST['f0'],
			$_POST['gain'],
			$_POST['mode'],
			$_POST['notes'],
			$_POST['responses'],
			$_POST['score'],
			$_POST['series'],
			$_POST['subuser'],
			$_POST['user']
		);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id);
		
		// post to Activity
		postToActivity('Synth',$_POST['subuser'],$_POST['user']);
}
?>