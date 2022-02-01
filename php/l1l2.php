<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		$query = $conn->prepare(
			"SELECT L1L2.*,
			CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
			CONCAT(p2.firstname,' ',p2.lastname) AS user
			FROM L1L2 
			INNER JOIN Profiles p1 on L1L2.subuser = p1.ID 
			INNER JOIN Profiles p2 on L1L2.user = p2.ID 
			WHERE subuser = ?"
		);
		$query->bind_param('i',$_GET['subuser']);
		$query->execute();
		echo json_encode(get_result($query)); break;
	case "POST":
		$behavior = convert2ID('Behavior','behavior',$_POST['behavior']);
		$ear = convert2ID('Ear','ear',$_POST['ear']);
		$language = convert2ID('Language','language',$language);
		$noise = convert2ID('Noise','noise',$_POST['noise']);
		$practice = convert2ID('Switch','switch',$_POST['practice']);
		
		$query = $conn->prepare(
			"INSERT INTO L1L2 (behavior,calls,ear,language,noise,notes,practice,responses,score,series,snr,subuser,user) 
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"
		);
		$query->bind_param('isiisisdsdii',
			$behavior,
			$_POST['calls'],
			$ear,
			$language,
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
		postToActivity('L1L2',$_POST['subuser'],$_POST['user']);
}
?>