<?php
function connect(){
	static $conn;
    if($conn===NULL){
		mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
		$conn = new mysqli('localhost','teamhearing','ou8aDurian!','teamhearing');
    }
    return $conn;
}
function convert2ID($table,$row,$value){
	$conn = connect();
	$query = $conn->prepare("SELECT ID FROM ".$table." WHERE ".$row."=?");
	$query->bind_param('s',$value);
	$query->execute();
	$query->store_result();
	$query->bind_result($ID);
	$query->fetch();
	$query->free_result();
	$query->close();
	return $ID;
}
function convert2ID_obsolete($table,$row,$value){
	$result = mysql_query("SELECT ID FROM ".$table." WHERE ".$row."='$value' ");
	if (!$result) { error(500, "Internal Server Error", "SQL error: " .  mysql_error()); }
	if (mysql_num_rows($result) != 1) { return false; }
	return mysql_result($result, 0, 0);
}
function get_result(\mysqli_stmt $statement){
    $result = array();
    $statement->store_result();
    for ($i = 0; $i < $statement->num_rows; $i++)
    {
        $metadata = $statement->result_metadata();
        $params = array();
        while ($field = $metadata->fetch_field())
        {
            $params[] = &$result[$i][$field->name];
        }
        call_user_func_array(array($statement, 'bind_result'), $params);
        $statement->fetch();
    }
    return $result;
}
function postToActivity($activity,$subuser,$user){
	$conn = connect();
	$activity = convert2ID('Activities','activity',$activity);
	$query = $conn->prepare("INSERT INTO Activity (activity,subuser,user) VALUES (?,?,?)");
	$query->bind_param('iii',$activity,$subuser,$user);
	$query->execute();
	$query->close();
}
function randCodename($chunkSize) {
	$checking = true;
	$codename = "";
	$conn = connect();
	while($checking){
		$codename = randSelection($chunkSize, "ABCDEFGHIJKLMNOPQRSTUVWXYZ")
			. "-" . randSelection($chunkSize, "0123456789");

		//
		$query = $conn->prepare("SELECT * FROM Profiles WHERE codename = ?");
		$query->bind_param('s',$codename);
		$query->execute();

		//
		if ($query->num_rows == 0) { $checking = false; };

		//
		$query->close();
	}
	return $codename;
}
function randSelection($size, $set) {
	$selection = "";
	$charsetmaxindex = strlen($set) - 1;

	while ($size--) {
		$c = $set[mt_rand(0, $charsetmaxindex)];
		$selection .= $c;
	}

	return $selection;
}
function randVerification($chunkSize) {
	return randSelection($chunkSize, "0123456789");
}
function saveVerification($id,$code){
	$id = (int)$id;
	echo json_encode($id);
	$query=$conn->prepare("INSERT INTO Verification (userid,vcode) VALUES (?,?)");
	$query->bind_param('is',$id,$code);
	$query->execute();
	$query->close();
}
function validateOne($sql){
	$result = mysql_query($sql);
	if (! $result) { error(500, "Internal Server Error", "SQL error: " .  mysql_error()); }
	if (mysql_num_rows($result) != 1) { return false; }
	return mysql_result($result, 0, 0);
}
$conn = connect();
?>
