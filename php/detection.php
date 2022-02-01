<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		// query
		$query = $conn->prepare(
			"SELECT Detection.*,
			CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
			CONCAT(p2.firstname,' ',p2.lastname) AS user
			FROM Detection 
			INNER JOIN Profiles p1 on Detection.subuser = p1.ID 
			INNER JOIN Profiles p2 on Detection.user = p2.ID 
			WHERE subuser = ?"
		);
		
		// bind query and execute
		$query->bind_param('i',$_GET['subuser']);
		$query->execute();
		
		// get result
		$result = get_result($query);
		
		// tell the world
		echo json_encode($result); break;
	case "POST":
		// convert to ID
		$ear = convert2ID('Ear','ear',$_POST['ear']);
		
		// form query
		$query = $conn->prepare(
			"INSERT INTO Detection 
			(adaptive,calls,ear,frequency,gain,practice,responses,subuser,user) 
			VALUES (?,?,?,?,?,?,?,?,?)"
		);
		
		// bind query and execute
		$query->bind_param('ssiddisii',
			$_POST['adaptive'],
			$_POST['calls'],
			$ear,
			$_POST['frequency'],
			$_POST['gain'],
			$_POST['practice'],
			$_POST['responses'],
			$_POST['subuser'],
			$_POST['user']
		);
		$query->execute();
		$query->close();
		
		// echo the ID for protocol tracking
		echo json_encode($conn->insert_id);
		
		// post to Activity
		$activity = convert2ID('Activities','activity','Detection');
		$query = $conn->prepare("INSERT INTO Activity (activity,subuser,user) VALUES (?,?,?)");
		$query->bind_param('iii',$activity,$_POST['subuser'],$_POST['user']);
		$query->execute();
		$query->close();
}
?>