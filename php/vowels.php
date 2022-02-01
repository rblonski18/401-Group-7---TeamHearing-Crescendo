<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		switch($_GET['method']){
			case 'highscore':
				$query = $conn->prepare(
					"SELECT level FROM Vowels
					WHERE subuser = ? && score > 79 && ear = ? && entry >= DATE '2020-12-10'
					ORDER BY level DESC LIMIT 1"
				);
				$query->bind_param('ii',$_GET['subuser'],$_GET['ear']);
				$query->execute();
				$result = get_result($query);
				break;
			default:
				$query = $conn->prepare(
					"SELECT Vowels.*, Behavior.behavior, Ear.ear, Noise.noise, Switch.switch AS practice,
					CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
					CONCAT(p2.firstname,' ',p2.lastname) AS user
					FROM Vowels
					LEFT JOIN Behavior ON Vowels.behavior = Behavior.ID
					LEFT JOIN Ear ON Vowels.ear = Ear.ID
					LEFT JOIN Noise ON Vowels.noise = Noise.ID
					LEFT JOIN Profiles p1 on Vowels.subuser = p1.ID 
					LEFT JOIN Profiles p2 on Vowels.user = p2.ID 
					LEFT JOIN Switch ON Vowels.practice = Switch.ID
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
		
		// post to Vowels
		$query = $conn->prepare(
			"INSERT INTO Vowels (
				behavior,calls,ear,enhanced,gain,level,material,noise,note,
				practice,responses,score,series,snr,voice,subuser,user
			) 
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
		);
		$query->bind_param('isiidiiisisdsisii',
			$behavior,
			$_POST['calls'],
			$ear,
			$_POST['enhanced'],
			$_POST['gain'],
			$_POST['level'],
			$_POST['material'],
			$noise,
			$_POST['note'],
			$practice,
			$_POST['responses'],
			$_POST['score'],
			$_POST['series'],
			$_POST['snr'],
			$_POST['voice'],
			$_POST['subuser'],
			$_POST['user']
		);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id);
		
		// post to Activity
		postToActivity('Vowels',$_POST['subuser'],$_POST['user']);
}
?>