<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		switch($_GET['method']){
			case 'all':
				$query = $conn->prepare(
					"SELECT *,
					CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
					CONCAT(p2.firstname,' ',p2.lastname) AS user
					FROM Harmonics
					INNER JOIN Profiles p1 on Harmonics.subuser = p1.ID 
					INNER JOIN Profiles p2 on Harmonics.user = p2.ID
					WHERE activity = ?"
				);
				$query->bind_param('i',$_GET['activity']);
				$query->execute();
				echo json_encode(get_result($query)); break;
			case 'top10':
				$query = $conn->prepare(
					"SELECT *,
					CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
					CONCAT(p2.firstname,' ',p2.lastname) AS user
					FROM Harmonics 
					INNER JOIN Profiles p1 on Harmonics.subuser = p1.ID 
					INNER JOIN Profiles p2 on Harmonics.user = p2.ID 
					WHERE activity = ?
					ORDER BY adaptive LIMIT 10"
				);
				$query->bind_param('i',$_GET['activity']);
				$query->execute();
				echo json_encode(get_result($query)); break;
			default:
				$query = $conn->prepare(
					"SELECT Harmonics.*,
					CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
					CONCAT(p2.firstname,' ',p2.lastname) AS user
					FROM Harmonics 
					INNER JOIN Profiles p1 on Harmonics.subuser = p1.ID 
					INNER JOIN Profiles p2 on Harmonics.user = p2.ID 
					WHERE activity = ? && subuser = ?"
				);
				$query->bind_param('ii',$_GET['activity'],$_GET['subuser']);
				$query->execute();
				echo json_encode(get_result($query));
		} break;
	case "POST":
		$ear = convert2ID('Ear','ear',$_POST['ear']);
		$query = $conn->prepare(
			"INSERT INTO Harmonics (
				activity,adaptive,calls,modDepth,duration,ear,filtertype,f0,f1,
				gain,mode,notes,responses,score,series,subuser,user
			) 
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
		);
		$query->bind_param('idsddisdddissdsii',
			$_POST['activity'],
			$_POST['adaptive'],
			$_POST['calls'],
			$_POST['depth'],
			$_POST['duration'],
			$ear,
			$_POST['filtertype'],
			$_POST['f0'],
			$_POST['f1'],
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
		postToActivity('Harmonics',$_POST['subuser'],$_POST['user']);
}
?>