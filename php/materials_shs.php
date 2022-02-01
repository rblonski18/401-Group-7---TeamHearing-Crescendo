<?php 

// DB access script
include_once 'teamhearing_db_connect.php';

// common utilities
include_once 'utilities.php';

// Use CRUD convention:
// HTTP GET - SELECT/Read
// HTTP PUT - UPDATE
// HTTP POST - INSERT/Create
// HTTP DELETE - DELETE

// for some reason, PHP does not directly support PUT and DELETE
global $_PUT;
global $_DELETE;

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
		break;
	default:
		error(500, "Internal Server Error", mysql_error());
		break;
}
return;

function create(){
	// inputs
	$filename = htmlspecialchars($_POST['filename'], ENT_QUOTES);
	$keyword = htmlspecialchars($_POST['keyword'], ENT_QUOTES);
	$phrase = htmlspecialchars($_POST['phrase'], ENT_QUOTES);
	$categoryId = htmlspecialchars($_POST['categoryId'], ENT_QUOTES);
	$groupId = htmlspecialchars($_POST['groupId'], ENT_QUOTES);
	$setId = htmlspecialchars($_POST['setId'], ENT_QUOTES);
	$typeId = htmlspecialchars($_POST['typeId'], ENT_QUOTES);

	// SQL
	$sql = "INSERT INTO tbl_materials_shs (filename, keyword, phrase, categoryId, groupId, setId, typeId) 
			VALUES ('$filename', '$keyword', '$phrase', '$categoryId', '$groupId', '$setId', '$typeId');";
	if (! mysql_query($sql))
	{
		error(500, "Internal Server Error", mysql_error());
	}
}
function read(){
	$caller = htmlspecialchars($_GET['caller'], ENT_QUOTES);
	$subject = htmlspecialchars($_GET['subject'], ENT_QUOTES);
	
	// SQL
	$sql = "SELECT * FROM tbl_materials_shs;";
	if (! ($r = mysql_query($sql))) {
		error(500, "Internal Server Error", mysql_error());
	}
	else
	{
		$rows = array();
		while ($row = mysql_fetch_assoc($r)) {
			$rows[] = $row;
		}
		echo json_encode($rows);
	}
}
function update(){
	global $_PUT;
	
	// inputs
	$id = htmlspecialchars($_DELETE['id'], ENT_QUOTES);
	
	// SQL
	$sql = "UPDATE tbl_materials_shs SET inputs WHERE id='$id'";
	if (! mysql_query($sql))
	{
		error(500, "Internal Server Error", mysql_error());
	}
	echo $sql;
}
function delete(){
	global $_DELETE;

	// inputs
	$id = htmlspecialchars($_DELETE['id'], ENT_QUOTES);

	// SQL
	$sql = "DELETE FROM tbl_materials_shs WHERE id='$id';";	
	if (! mysql_query($sql))
	{
		error(500, "Internal Server Error", mysql_error());
	}
}

?>