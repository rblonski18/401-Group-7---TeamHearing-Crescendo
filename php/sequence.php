<?php
include_once 'utilities.php';

switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		$query = $conn->prepare(
			"SELECT 
			(score,level)
			FROM Sequence 
			WHERE user = ? AND mode = ?"
		);
		$query->bind_param('ii',$_GET['user'], $_GET['mode']);
		$query->execute();
		echo json_encode(get_result($query)); 
		break;
		
	case "POST":		
		$query = $conn->prepare(
			"INSERT INTO Sequence (entry,mode,score,level,user,subuser) 
			VALUES (?,?,?,?,?,?)"
		);
		$query->bind_param('siiiii',
			date("Y-m-d"),
			$_POST['mode'],
			$_POST['score'],
			$_POST['level'],
			$_POST['user'],
			$_POST['subuser']
		);
		$query->execute();
		$query->close();
		break;
}
?>