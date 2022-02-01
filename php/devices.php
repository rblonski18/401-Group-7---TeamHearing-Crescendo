<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		$query = $conn->prepare(
			"SELECT Devices.*, Device.device, Ear.ear, Manufacturer.manufacturer, Status.status,
			CONCAT(p1.firstname,' ',p1.lastname) AS subuser, 
			CONCAT(p2.firstname,' ',p2.lastname) AS user
			FROM Devices 
			INNER JOIN Device ON Devices.device = Device.ID 
			INNER JOIN Ear ON Devices.ear = Ear.ID
			INNER JOIN Manufacturer ON Devices.manufacturer = Manufacturer.ID
			INNER JOIN Profiles p1 on Devices.subuser = p1.ID 
			INNER JOIN Profiles p2 on Devices.user = p2.ID 
			INNER JOIN Status ON Devices.status = Status.ID
			WHERE subuser = ?"
		);
		$query->bind_param('i',$_GET['subuser']);
		$query->execute();
		echo json_encode(get_result($query)); break;
	case "POST":
		$device = convert2ID('Device','device',$_POST['device']);
		$ear = convert2ID('Ear','ear',$_POST['ear']);
		$manufacturer = convert2ID('Manufacturer','manufacturer',$_POST['manufacturer']);
		$status = convert2ID('Status','status',$_POST['status']);
		
		$query = $conn->prepare(
			"INSERT INTO Devices (activation,device,ear,manufacturer,model,notes,status,subuser,user) 
			VALUES (?,?,?,?,?,?,?,?,?)"
		);
		$query->bind_param('siiiisiii',
			$_POST['activation'],
			$device,
			$ear,
			$manufacturer,
			$_POST['model'],
			$_POST['notes'],
			$status,
			$_POST['subuser'],
			$_POST['user']
		);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id); break;
	case "PUT":
		parse_str(file_get_contents("php://input"),$_PUT);
		$device = convert2ID('Device','device',$_PUT['device']);
		$ear = convert2ID('Ear','ear',$_PUT['ear']);
		$manufacturer = convert2ID('Manufacturer','manufacturer',$_PUT['manufacturer']);
		$status = convert2ID('Status','status',$_PUT['status']);
		
		$query = $conn->prepare(
			"UPDATE Devices SET activation=?, device=?, ear=?, manufacturer=?, model=? 
			WHERE ID = ?"
		);
		$query->bind_param('siiiii',
			$_PUT['activation'],
			$device,
			$ear,
			$manufacturer,
			$_PUT['model'],
			$_PUT['ID']
		);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id); break;
	case "DELETE":
		// inputs
		parse_str(file_get_contents("php://input"),$_DELETE);
	
		// delete profile
		$query = $conn->prepare("DELETE FROM Devices WHERE ID = ?");
		$query->bind_param('i',$_DELETE['ID']);
		$query->execute();
		echo json_encode($query->affected_rows);
		$query->close();
}
?>