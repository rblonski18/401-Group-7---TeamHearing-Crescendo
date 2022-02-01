<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		$query = $conn->prepare("SELECT * FROM SPIN WHERE subuser = ?");
		$query->bind_param('i',$_GET['subuser']);
		$query->execute();
		$result = get_result($query);
		echo json_encode($result); break;
	case "POST":
		// convert to ID
		$behavior = convert2ID('Behavior','behavior',$_POST['behavior']);
		$context = convert2ID('Switch','switch',$_POST['context']);
		$ear = convert2ID('Ear','ear',$_POST['ear']);
		$noise = convert2ID('Noise','noise',$_POST['noise']);
		$practice = convert2ID('Switch','switch',$_POST['switch']);
		
		//
		$query = $conn->prepare(
			"INSERT INTO SPIN (behavior,calls,context,ear,noise,notes,practice,responses,score,series,snr,subuser,user) 
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"
		);
		
		//
		$query->bind_param('isiiisisdsdii',
			$behavior,
			$_POST['calls'],
			$context,
			$ear,
			$noise,
			$_POST['notes'],
			$practice,
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
		postToActivity('SPIN',$_POST['subuser'],$_POST['user']);
}
?>