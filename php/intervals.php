<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		switch($_GET['method']){
			case 'highscore':
				$query = $conn->prepare(
					"SELECT level FROM Intervals
					WHERE subuser = ? && level < 100 && score > 79 && entry >= DATE '2020-12-10'
					ORDER BY level DESC LIMIT 1"
				);
				$query->bind_param('i',$_GET['subuser']);
				$query->execute();
				$result = get_result($query);
				break;
			default:
				$query = $conn->prepare(
					"SELECT Intervals.*,
					CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
					CONCAT(p2.firstname,' ',p2.lastname) AS user
					FROM Intervals 
					INNER JOIN Profiles p1 on Intervals.subuser = p1.ID 
					INNER JOIN Profiles p2 on Intervals.user = p2.ID 
					WHERE subuser = ?"
				);
				$query->bind_param('i',$_GET['subuser']);
				$query->execute();
				$result = get_result($query);
				break;
		}
		echo json_encode($result); break;
	case "POST":
		// convert to ID
		$ear = convert2ID('Ear','ear',$_POST['ear']);
		
		// post to Intervals
		$query = $conn->prepare(
			"INSERT INTO Intervals (calls,ear,gain,intervals,level,mode,notes,practice,responses,roots,score,subuser,user) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"
		);
		$query->bind_param('sidsiisissdii',
			$_POST['calls'],
			$ear,
			$_POST['gain'],
			$_POST['intervals'],
			$_POST['level'],
			$_POST['mode'],
			$_POST['notes'],
			$_POST['practice'],
			$_POST['responses'],
			$_POST['roots'],
			$_POST['score'],
			$_POST['subuser'],
			$_POST['user']
		);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id);
		
		// post to Activity
		postToActivity('Intervals',$_POST['subuser'],$_POST['user']);
}
?>