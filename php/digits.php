<?php
include_once 'connection.php';
include_once 'utilities.php';

global $_PUT, $_DELETE;
switch ($_SERVER['REQUEST_METHOD']) {
	case "POST":
		create();
		break;
	case "GET":
		read();
		break;
	case "PUT":
		$_PUT = array();
		$content = trim(file_get_contents('php://input'));
		parse_str($content, $_PUT);
		update();
		break;
	case "DELETE":
		$_DELETE = array();
		$content = trim(file_get_contents('php://input'));
		parse_str($content, $_DELETE);
		delete();
} return;

function create(){
	// inputs
	$audio = htmlspecialchars($_POST['audio'],ENT_QUOTES);
	$behavior = htmlspecialchars($_POST['behavior'],ENT_QUOTES);
	$ear = htmlspecialchars($_POST['ear'],ENT_QUOTES);
	$noise = htmlspecialchars($_POST['noise'],ENT_QUOTES);
	$notes = htmlspecialchars($_POST['notes'],ENT_QUOTES);
	$practice = htmlspecialchars($_POST['practice'],ENT_QUOTES);
	$score = htmlspecialchars($_POST['score'],ENT_QUOTES);
	$series = htmlspecialchars($_POST['series'],ENT_QUOTES);
	$snr = htmlspecialchars($_POST['snr'],ENT_QUOTES);
	$subuser = htmlspecialchars($_POST['subuser'],ENT_QUOTES);
	$user = htmlspecialchars($_POST['user'],ENT_QUOTES);
	$video = htmlspecialchars($_POST['video'],ENT_QUOTES);
	
	// convert to ID
	$audio = convert2ID('Switch','switch',$audio);
	$behavior = convert2ID('Behavior','behavior',$behavior);
	$ear = convert2ID('Ear','ear',$ear);
	$noise = convert2ID('Noise','noise',$noise);
	$practice = convert2ID('Switch','switch',$practice);
	$video = convert2ID('Switch','switch',$video);
	
	// SQL
	$sql = "INSERT INTO Digits (audio,behavior,ear,entry,noise,notes,practice,score,series,snr,subuser,user,video) 
			VALUES ('$audio','$behavior','$ear',now(),'$noise','$notes','$practice','$score','$series','$snr','$subuser','$user','$video');";
	mysql_query($sql);
}
function read(){
	// inputs
	$password = htmlspecialchars($_GET['password'],ENT_QUOTES);
	$subuser = htmlspecialchars($_GET['subuser'],ENT_QUOTES);
	$user = htmlspecialchars($_GET['user'],ENT_QUOTES);
	
	// SQL
	$sql = "SELECT Digits.*, Behavior.behavior, Ear.ear, Noise.noise, 
			S1.switch AS audio, S2.switch AS practice, S3.switch AS video,
			CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
			CONCAT(p2.firstname,' ',p2.lastname) AS user
			FROM Digits
			LEFT JOIN Behavior ON Digits.behavior = Behavior.ID
			LEFT JOIN Ear ON Digits.ear = Ear.ID
			LEFT JOIN Noise ON Digits.noise = Noise.ID
			LEFT JOIN Profiles p1 on Digits.subuser = p1.ID 
			LEFT JOIN Profiles p2 on Digits.user = p2.ID 
			LEFT JOIN Switch S1 ON Digits.audio = S1.ID
			LEFT JOIN Switch S2 ON Digits.practice = S2.ID
			LEFT JOIN Switch S3 ON Digits.video = S3.ID
			WHERE subuser = '$subuser';";
	$result = mysql_query($sql);

	// outputs
	$rows = array();
	while ($row = mysql_fetch_assoc($result)) {$rows[] = $row;}
	echo json_encode($rows);
}
function update(){
	global $_PUT;
}
function delete(){
	global $_DELETE;
}
?>