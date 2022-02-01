<?php
include_once 'utilities.php';
switch ($_SERVER['REQUEST_METHOD']) {
	case "GET":	
		switch ($_GET['method']) {
			case 'incrementMusic':
				$query = $conn->prepare(
					"SELECT music FROM Gambling
					ORDER BY ID DESC LIMIT 1"
				);
				$query->execute();
				$result = get_result($query);
				break;	
			default:
				$query = $conn->prepare(
					"SELECT Gambling.*,
					CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
					CONCAT(p2.firstname,' ',p2.lastname) AS user
					FROM Gambling 
					INNER JOIN Profiles p1 on Gambling.subuser = p1.ID 
					INNER JOIN Profiles p2 on Gambling.user = p2.ID 
					WHERE subuser = ?"
				);
				$query->bind_param('i',$_GET['subuser']);
				$query->execute();
				$result = get_result($query);
				break;
		}
		echo json_encode($result); break;
	case "POST":
		// convert to ID
		$ear = convert2ID('Ear','ear',$_POST['ear']);
		
		// post to Gambling
		$query = $conn->prepare(
			"INSERT INTO Gambling (ear,gain,gainAB,gainCD,lossAB,lossCD,lossProbAC,lossProbBD,moneyList,music,notes,penalties,response1,response2,response2After,responses,responseTime,subuser,user) 
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
		);
		$query->bind_param('idddddddsisssssssii',
			$ear,
			$_POST['gain'],
			$_POST['gainAB'],
			$_POST['gainCD'],
			$_POST['lossAB'],
			$_POST['lossCD'],
			$_POST['lossProbAC'],
			$_POST['lossProbBD'],
			$_POST['moneyList'],
			$_POST['music'],
			$_POST['notes'],
			$_POST['penalties'],
			$_POST['response1'],
			$_POST['response2'],
			$_POST['response2After'],
			$_POST['responses'],
			$_POST['responseTime'],
			$_POST['subuser'],
			$_POST['user']
		);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id);
		
		// post to Activity
		postToActivity('Gambling',$_POST['subuser'],$_POST['user']);
}
?>