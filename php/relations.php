<?php 
include_once 'connection.php';

global $_PUT, $_DELETE;

// CRUD switch
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

// CRUD functions
function create(){
	// inputs
	$author = htmlspecialchars($_POST['user'],ENT_QUOTES);
	$object = htmlspecialchars($_POST['subuser'],ENT_QUOTES);
	$relation = htmlspecialchars($_POST['relation'],ENT_QUOTES);
	$subject = htmlspecialchars($_POST['user'],ENT_QUOTES);

	// SQL
	$sql = "INSERT INTO Relations (author,entry,object,relation,subject) 
			VALUES (now(),'$relation','$object','$subuser','$user');";
	mysql_query($sql);
}
function read(){
	// inputs
	$user = htmlspecialchars($_GET['user'],ENT_QUOTES);
	$object = htmlspecialchars($_GET['subuser'],ENT_QUOTES);
	
	// SQL
	$sql = "SELECT R.*, 
			CONCAT(p1.firstname,' ',p1.lastname) AS author, 
			CONCAT(p2.firstname,' ',p2.lastname) AS subject, 
			CONCAT(p3.firstname,' ',p3.lastname) AS object,
			r.relation AS relation 
			FROM Relations R 
			LEFT JOIN Profiles p1 on R.author = p1.ID 
			LEFT JOIN Profiles p2 on R.subject = p2.ID 
			LEFT JOIN Profiles p3 on R.object = p3.ID 
			LEFT JOIN Relation r on R.relation = r.ID 
			WHERE object = '$object';";
	$result = mysql_query($sql);
	
	// outputs
	$rows = array();
	while ($row = mysql_fetch_assoc($result)) { $rows[] = $row; }
	echo json_encode($rows);
}
function update(){
	global $_PUT;
	
	// inputs
	$caller = htmlspecialchars($_PUT['caller'],ENT_QUOTES);	
	$id = htmlspecialchars($_PUT['id'],ENT_QUOTES);
	$object = htmlspecialchars($_PUT['object'],ENT_QUOTES);
	$type = htmlspecialchars($_PUT['type'],ENT_QUOTES);
	$now = date('Y-m-d H:i:s', time());
	
	// convert to ID
	$type = validateType($type);
	
	// SQL
	$sql = "UPDATE Relations SET type='$type', lastupdate='$now' WHERE id='$id'";
	mysql_query($sql);
}
function delete(){
	global $_DELETE;

	// inputs
	$caller = htmlspecialchars($_DELETE['caller'],ENT_QUOTES);	
	$id = htmlspecialchars($_DELETE['id'],ENT_QUOTES);

	// SQL
	$sql = "DELETE FROM Relations WHERE id='$id';";	
	mysql_query($sql);
}
?>