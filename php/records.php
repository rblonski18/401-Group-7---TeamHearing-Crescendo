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
	// initialize variables
	$author = htmlspecialchars($_POST['author'],ENT_QUOTES);
	$subject = htmlspecialchars($_POST['subject'],ENT_QUOTES);
	$typeindex = htmlspecialchars($_POST['typeindex'],ENT_QUOTES);

	$alpha1 = "";
	$numeric1 = "";
	$numeric2 = "";
	$numeric3 = "";
	$numeric4 = "";
	$numeric5 = "";
	$numeric6 = "";
	$numeric7 = "";
	$numeric8 = "";
	getRequestArguments($_POST, $alpha1, $numeric1, $numeric2, $numeric3, $numeric4, $numeric5, $numeric6, $numeric7, $numeric8);

	// SQL
	$sql = "INSERT INTO Records (author, subject, recordtype, alpha1, numeric1, numeric2, numeric3, numeric4, numeric5, numeric6, numeric7, numeric8) 
			VALUES ('$author', '$subject', '$typeindex', '$alpha1', '$numeric1', '$numeric2', '$numeric3', '$numeric4', '$numeric5', '$numeric6', '$numeric7', '$numeric8')";
	mysql_query($sql);
}
function read(){
	$author = htmlspecialchars($_GET['author'], ENT_QUOTES);
	$subject = htmlspecialchars($_GET['subject'], ENT_QUOTES);
	$method = htmlspecialchars($_GET['method'], ENT_QUOTES);

	// Return an object for consumption by JS
	if ($method=="measures")
	{
		$sql = "SELECT * FROM Records INNER JOIN tbl_recordType ON tbl_records.recordtype=tbl_recordType.typeid WHERE tbl_records.author='$author' AND tbl_records.subject='$subject'";
	}
	else //method is for recordType
	{
		$sql = "SELECT * FROM tbl_recordType WHERE 1=1";
	}
	if (! ($r = mysql_query($sql))) {
		getError(500, "Internal Server Error", mysql_error());
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
	
	$id = "";
	$alpha1 = "";
	$numeric1 = "";
	$numeric2 = "";
	$numeric3 = "";
	$numeric4 = "";
	$numeric5 = "";
	$numeric6 = "";
	$numeric7 = "";
	$numeric8 = "";
	
	getRequestID($_PUT, $id);

	getRequestArguments($_PUT, $alpha1, $numeric1, $numeric2, $numeric3, $numeric4, $numeric5, $numeric6, $numeric7, $numeric8);
	
	$sql = "UPDATE tbl_records SET 
				alpha1='$alpha1', 
				numeric1='$numeric1', 
				numeric2='$numeric2', 
				numeric3='$numeric3', 
				numeric4='$numeric4', 
				numeric5='$numeric5', 
				numeric6='$numeric6', 
				numeric7='$numeric7', 
				numeric8='$numeric8'
			WHERE id = '$id'";

	if (! mysql_query($sql))
	{
		getError(500, "Internal Server Error", mysql_error());
	}

	echo $sql;
}
function delete(){
	global $_DELETE;

	$callerName = "";
	$id = "";

	getCaller($_DELETE, $callerName);
	getRequestID($_DELETE, $id);

	$sql = "DELETE FROM tbl_records WHERE id = '$id';";
	
	if (! mysql_query($sql))
	{
		getError(500, "Internal Server Error", mysql_error());
	}
	
	echo "0";
}

// utilities
function getRequestID($HTTPMessage, &$id) {
	$id = htmlspecialchars($HTTPMessage['id'], ENT_QUOTES);
}
function getRequestArguments($HTTPMessage, &$alpha1, &$numeric1, &$numeric2, &$numeric3, &$numeric4, &$numeric5, &$numeric6, &$numeric7, &$numeric8){
	$alpha1 = htmlspecialchars($HTTPMessage['alpha1'],ENT_QUOTES);
	$numeric1 = htmlspecialchars($HTTPMessage['numeric1'],ENT_QUOTES);
	$numeric2 = htmlspecialchars($HTTPMessage['numeric2'],ENT_QUOTES);
	$numeric3 = htmlspecialchars($HTTPMessage['numeric3'],ENT_QUOTES);
	$numeric4 = htmlspecialchars($HTTPMessage['numeric4'],ENT_QUOTES);
	$numeric5 = htmlspecialchars($HTTPMessage['numeric5'],ENT_QUOTES);
	$numeric6 = htmlspecialchars($HTTPMessage['numeric6'],ENT_QUOTES);
	$numeric7 = htmlspecialchars($HTTPMessage['numeric7'],ENT_QUOTES);
	$numeric8 = htmlspecialchars($HTTPMessage['numeric8'],ENT_QUOTES);
}
function getError($code, $httpMsg, $exitMsg) {
	error($code, $httpMsg, 'Record Error: ' . $exitMsg);
}
?>