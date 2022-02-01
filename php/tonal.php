<?php
include_once 'connection.php';
include_once 'utilities.php';
 
global $_PUT, $_DELETE;
switch ($_SERVER['REQUEST_METHOD']) {
	case "POST":
		// inputs
		$calls = htmlspecialchars($_POST['calls'],ENT_QUOTES);
		$duration = htmlspecialchars($_POST['duration'],ENT_QUOTES);
		$ear = htmlspecialchars($_POST['ear'],ENT_QUOTES);
		$f0 = htmlspecialchars($_POST['f0'],ENT_QUOTES);
		$f1 = htmlspecialchars($_POST['f1'],ENT_QUOTES);
		$notes = htmlspecialchars($_POST['notes'],ENT_QUOTES);
		$responses = htmlspecialchars($_POST['responses'],ENT_QUOTES);
		$score = htmlspecialchars($_POST['score'],ENT_QUOTES);
		$series = htmlspecialchars($_POST['series'],ENT_QUOTES);
		$subuser = htmlspecialchars($_POST['subuser'],ENT_QUOTES);
		$user = htmlspecialchars($_POST['user'],ENT_QUOTES);
		
		// convert to ID
		$ear = convert2ID('Ear','ear',$ear);

		// SQL
		$sql = "INSERT INTO Tonal (calls,duration,ear,f0,f1,notes,entry,responses,score,series,subuser,user) 
				VALUES ('$calls','$duration','$ear','$f0','$f1','$notes',now(),'$responses','$score','$series','$subuser','$user');";
		
		mysql_query($sql);
		break;
	case "GET":
		// inputs
		$password = htmlspecialchars($_GET['password'],ENT_QUOTES);
		$subuser = htmlspecialchars($_GET['subuser'],ENT_QUOTES);
		$user = htmlspecialchars($_GET['user'],ENT_QUOTES);

		// SQL
		$sql = "SELECT Tonal.*,
				CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
				CONCAT(p2.firstname,' ',p2.lastname) AS user
				FROM Tonal
				INNER JOIN Profiles p1 on Tonal.subuser = p1.ID 
				INNER JOIN Profiles p2 on Tonal.user = p2.ID 
				WHERE subuser = '$subuser';";
		$result = mysql_query($sql);

		// outputs
		$rows = array();
		while ($row = mysql_fetch_assoc($result)) {$rows[] = $row;}
		echo json_encode($rows);
		break;
	case "PUT":
		$_PUT = array();
		$content = trim(file_get_contents('php://input'));
		parse_str($content, $_PUT);
		break;
	case "DELETE":
		$_DELETE = array();
		$content = trim(file_get_contents('php://input'));
		parse_str($content, $_DELETE);
} return;
?>