<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		$query = $conn->prepare(
			"SELECT MRT.*,
			CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
			CONCAT(p2.firstname,' ',p2.lastname) AS user
			FROM MRT 
			INNER JOIN Profiles p1 on MRT.subuser = p1.ID 
			INNER JOIN Profiles p2 on MRT.user = p2.ID 
			WHERE subuser = ?"
		);
		$query->bind_param('i',$_GET['subuser']);
		$query->execute();
		echo json_encode(get_result($query)); break;
	case "POST":
		$audio = convert2ID('Switch','switch',$audio);
		$behavior = convert2ID('Behavior','behavior',$_POST['behavior']);
		$ear = convert2ID('Ear','ear',$_POST['ear']);
		$noise = convert2ID('Noise','noise',$_POST['noise']);
		$practice = convert2ID('Switch','switch',$_POST['practice']);
		$video = convert2ID('Switch','switch',$video);
		
		$query = $conn->prepare(
			"INSERT INTO MRT (audio,behavior,calls,ear,noise,notes,practice,responses,score,series,snr,video,subuser,user) 
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
		);
		$query->bind_param('iisiisisdsdiii',
			$audio,
			$behavior,
			$_POST['calls'],
			$ear,
			$noise,
			$_POST['notes'],
			$practice,
			$_POST['responses'],
			$_POST['score'],
			$_POST['series'],
			$_POST['snr'],
			$video,
			$_POST['subuser'],
			$_POST['user']
		);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id);
		
		// post to Activity
		postToActivity('MRT',$_POST['subuser'],$_POST['user']);
}
?>