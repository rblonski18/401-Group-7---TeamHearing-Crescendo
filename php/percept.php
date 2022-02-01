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
	$activity = htmlspecialchars($_POST['activity'],ENT_QUOTES);
	$correct = htmlspecialchars($_POST['correct'],ENT_QUOTES);
	$difference = htmlspecialchars($_POST['difference'],ENT_QUOTES);
	$practice = htmlspecialchars($_POST['practice'],ENT_QUOTES);
	$series = htmlspecialchars($_POST['series'],ENT_QUOTES);
	$settings = htmlspecialchars($_POST['settings'],ENT_QUOTES);
	$subuser = htmlspecialchars($_POST['subuser'],ENT_QUOTES);
	$user = htmlspecialchars($_POST['user'],ENT_QUOTES);
	
	// convert to ID
	$activity = convert2ID('Activity','activity',$activity);
	$practice = convert2ID('Switch','switch',$practice);

	// SQL
	$sql = "INSERT INTO Percept (activity,correct,difference,entry,practice,series,settings,subuser,user) 
			VALUES ('$activity','$correct','$difference',now(),'$practice','$series','$settings','$subuser','$user');";
	mysql_query($sql);
}
function read(){
	// inputs
	$password = htmlspecialchars($_GET['password'],ENT_QUOTES);
	$subuser = htmlspecialchars($_GET['subuser'],ENT_QUOTES);
	$user = htmlspecialchars($_GET['user'],ENT_QUOTES);
	
	// SQL
	$sql = "SELECT Percept.*, Activity.activity, Switch.switch AS practice,
			CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
			CONCAT(p2.firstname,' ',p2.lastname) AS user
			FROM Percept
			LEFT JOIN Profiles p1 on Percept.subuser = p1.ID 
			LEFT JOIN Profiles p2 on Percept.user = p2.ID 
			LEFT JOIN Activity ON Percept.activity = Activity.ID
			LEFT JOIN Switch ON Percept.practice = Switch.ID
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