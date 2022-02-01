<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		switch($_GET['method']){
			case 'highscore':
				$query = $conn->prepare(
					"SELECT level FROM Consonants
					WHERE subuser = ? && score > 79 && ear = ? && entry >= DATE '2020-12-10'
					ORDER BY ID DESC LIMIT 1"
				);
				$query->bind_param('ii',$_GET['subuser'],$_GET['ear']);
				$query->execute();
				$result = get_result($query);
				break;
			default:
				$query = $conn->prepare(
					"SELECT Consonants.*, Behavior.behavior, Ear.ear, Noise.noise, Switch.switch AS practice,
						CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
						CONCAT(p2.firstname,' ',p2.lastname) AS user
						FROM Consonants
						INNER JOIN Behavior ON Consonants.behavior = Behavior.ID
						INNER JOIN Ear ON Consonants.ear = Ear.ID
						INNER JOIN Noise ON Consonants.noise = Noise.ID
						INNER JOIN Profiles p1 on Consonants.subuser = p1.ID 
						INNER JOIN Profiles p2 on Consonants.user = p2.ID 
						INNER JOIN Switch ON Consonants.practice = Switch.ID
					WHERE subuser = ?"
				);
				$query->bind_param('i',$_GET['subuser']);
				$query->execute();
				$result = get_result($query);
		}
		echo json_encode($result); break;
	case "POST":
		// convert to ID
		$behavior = convert2ID('Behavior','behavior',$_POST['behavior']);
		$ear = convert2ID('Ear','ear',$_POST['ear']);
		$noise = convert2ID('Noise','noise',$_POST['noise']);
		$practice = convert2ID('Switch','switch',$_POST['practice']);
		
		// post to Consonants
		$query = $conn->prepare(
			"INSERT INTO Consonants (
				behavior,calls,ear,enhanced,gain,gender,level,material,noise,
				notes,practice,responses,score,series,snr,subuser,talker,user
			) 
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
		);
		$query->bind_param('isiidsiiisisdsiisi',
			$behavior,
			$_POST['calls'],
			$ear,
			$_POST['enhanced'],
			$_POST['gain'],
			$_POST['gender'],
			$_POST['level'],
			$_POST['material'],
			$noise,
			$_POST['notes'],
			$practice,
			$_POST['responses'],
			$_POST['score'],
			$_POST['series'],
			$_POST['snr'],
			$_POST['subuser'],
			$_POST['talker'],
			$_POST['user']
		);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id);
		
		// post to Activity
		postToActivity('Consonants',$_POST['subuser'],$_POST['user']);
}
?>