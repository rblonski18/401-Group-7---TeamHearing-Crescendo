<?php
include_once 'connection.php';
include_once 'utilities.php';

global $_PUT, $_DELETE;
switch ($_SERVER['REQUEST_METHOD']) {
	case "POST":
		// inputs
		$delayRight = htmlspecialchars($_POST['delayRight'],ENT_QUOTES);
		$duration = htmlspecialchars($_POST['duration'],ENT_QUOTES);
		$ear = htmlspecialchars($_POST['ear'],ENT_QUOTES);
		$f0 = htmlspecialchars($_POST['f0'],ENT_QUOTES);
		$f1 = htmlspecialchars($_POST['f1'],ENT_QUOTES);
		$f1Left = htmlspecialchars($_POST['f1Left'],ENT_QUOTES);
		$f1Right = htmlspecialchars($_POST['f1Right'],ENT_QUOTES);
		$gainLeft = htmlspecialchars($_POST['gainLeft'],ENT_QUOTES);
		$gainRight = htmlspecialchars($_POST['gainRight'],ENT_QUOTES);
		$notes = htmlspecialchars($_POST['notes'],ENT_QUOTES);
		$score = htmlspecialchars($_POST['score'],ENT_QUOTES);
		$series = htmlspecialchars($_POST['series'],ENT_QUOTES);
		$subuser = htmlspecialchars($_POST['subuser'],ENT_QUOTES);
		$user = htmlspecialchars($_POST['user'],ENT_QUOTES);
		
		// convert to ID
		$ear = convert2ID('Ear','ear',$ear);

		// SQL
		$sql = "INSERT INTO BMLD (delayRight,duration,ear,f0,f1,f1Left,f1Right,gainLeft,gainRight,notes,entry,score,series,subuser,user) 
				VALUES ('$delayRight','$duration','$ear','$f0','$f1','$f1Left','$f1Right','$gainLeft','$gainRight','$notes',now(),'$score','$series','$subuser','$user');";
		mysql_query($sql);
		break;
	case "GET":
		// inputs
		$password = htmlspecialchars($_GET['password'],ENT_QUOTES);
		$subuser = htmlspecialchars($_GET['subuser'],ENT_QUOTES);
		$user = htmlspecialchars($_GET['user'],ENT_QUOTES);

		// SQL
		$sql = "SELECT BMLD.*,
				CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
				CONCAT(p2.firstname,' ',p2.lastname) AS user
				FROM BMLD
				INNER JOIN Profiles p1 on BMLD.subuser = p1.ID 
				INNER JOIN Profiles p2 on BMLD.user = p2.ID 
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