<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		switch($_GET['method']){
			case 'highscore':
				$query = $conn->prepare(
					"SELECT level FROM Musescore
					WHERE subuser = ? && level < 100 && score > 79 && entry >= DATE '2020-12-10'
					ORDER BY level DESC LIMIT 1"
				);
				$query->bind_param('i',$_GET['subuser']);
				$query->execute();
				$result = get_result($query);
				break;
			default:
				$query = $conn->prepare(
					"SELECT Musescore.*,
					CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
					CONCAT(p2.firstname,' ',p2.lastname) AS user
					FROM Musescore 
					INNER JOIN Profiles p1 on Musescore.subuser = p1.ID 
					INNER JOIN Profiles p2 on Musescore.user = p2.ID 
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
		
		// post to Musescore
		$query = $conn->prepare(
			"INSERT INTO Musescore (calls,ear,f0,gain,instrument,instrument2,intervals,mode,notes,practice,responses,roots,score,subuser,timbreMode,user,vocoder,vocoderTone) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
		);
		$query->bind_param('siddsssisissdiiiii',
			$_POST['calls'],
			$ear,
			$_POST['f0'],
			$_POST['gain'],
			$_POST['instrument'],
			$_POST['instrument2'],
			$_POST['intervals'],
			$_POST['mode'],
			$_POST['notes'],
			$_POST['practice'],
			$_POST['responses'],
			$_POST['roots'],
			$_POST['score'],
			$_POST['subuser'],
			$_POST['timbreMode'],
			$_POST['user'],
			$_POST['vocoder'],
			$_POST['vocoderTone']
		);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id);
		
		// post to Activity
		postToActivity('Musescore',$_POST['subuser'],$_POST['user']);
}
?>