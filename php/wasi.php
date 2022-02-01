<?php
// WASI MATRIX REASONING VERSION 2
include_once 'connection.php';
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		// inputs
		$password = htmlspecialchars($_GET['password'],ENT_QUOTES);
		$subuser = htmlspecialchars($_GET['subuser'],ENT_QUOTES);
		$user = htmlspecialchars($_GET['user'],ENT_QUOTES);

		$sql = "SELECT * FROM Profiles WHERE ID='$subuser';"; // also in ex online
		$result = mysql_query($sql);

		// outputs
		$rows = array();
		while ($row = mysql_fetch_assoc($result)) { $rows[] = $row; }
		echo json_encode($rows); break;
	case "POST":
		// inputs
		$matrix_item_numbers = htmlspecialchars($_POST['matrix_item_numbers'],ENT_QUOTES);
		$matrix_responses = htmlspecialchars($_POST['matrix_responses'],ENT_QUOTES);
		$matrix_correct = htmlspecialchars($_POST['matrix_correct'],ENT_QUOTES);
		$matrix_answer_key = htmlspecialchars($_POST['matrix_answer_key'],ENT_QUOTES);
		$subuser = htmlspecialchars($_POST['subuser'],ENT_QUOTES);
		$user = htmlspecialchars($_POST['user'],ENT_QUOTES);

		// SQL
		$sql = "INSERT INTO WASI (entry,matrix_item_numbers,matrix_responses,matrix_correct,matrix_answer_key,subuser,user)
				VALUES (now(),'$matrix_item_numbers','$matrix_responses','$matrix_correct','$matrix_answer_key','$subuser','$user');";
		mysql_query($sql); break;
}
?>
