<?php
include_once 'connection.php';
include_once 'utilities.php';
 
global $_PUT, $_DELETE;
switch ($_SERVER['REQUEST_METHOD']) {
	case "GET":
		// inputs
		$password = htmlspecialchars($_GET['password'],ENT_QUOTES);
		$subuser = htmlspecialchars($_GET['subuser'],ENT_QUOTES);
		$user = htmlspecialchars($_GET['user'],ENT_QUOTES);

		// SQL
		$sql = "SELECT Speech.*,
				CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
				CONCAT(p2.firstname,' ',p2.lastname) AS user
				FROM Speech
				INNER JOIN Profiles p1 on Speech.subuser = p1.ID 
				INNER JOIN Profiles p2 on Speech.user = p2.ID 
				WHERE subuser = '$subuser';";
		$result = mysql_query($sql);

		// outputs
		$rows = array();
		while ($row = mysql_fetch_assoc($result)) {$rows[] = $row;}
		echo json_encode($rows);
		break;
	case "POST":
		//
		$ear = htmlspecialchars($_POST['ear'],ENT_QUOTES);
		$level = htmlspecialchars($_POST['level'],ENT_QUOTES);
		$material = htmlspecialchars($_POST['material'],ENT_QUOTES);
		$materialType = htmlspecialchars($_POST['materialType'],ENT_QUOTES);
		$score = htmlspecialchars($_POST['score'],ENT_QUOTES);
		$snr = htmlspecialchars($_POST['snr'],ENT_QUOTES);
		$subuser = htmlspecialchars($_POST['subuser'],ENT_QUOTES);
		$user = htmlspecialchars($_POST['user'],ENT_QUOTES);
		
		// convert to ID
		$ear = convert2ID('Ear','ear',$ear);

		// sql statement
		$sql = "INSERT INTO Speech (entry,ear,level,material,materialType,score,snr,subuser,user) 
				VALUES (now(),'$ear','$level','$material','$materialType','$score','$snr','$subuser','$user');";
			
		//
		mysql_query($sql);
}
?>