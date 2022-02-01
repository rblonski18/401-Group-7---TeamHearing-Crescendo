<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		switch($_GET['method']){
			case 'newmessages':
				$sql = "SELECT Messages.*, 
					CONCAT(p1.firstname,' ',p1.lastname) AS sendername,
					CONCAT(p2.firstname,' ',p2.lastname) AS recipientname
					FROM Messages
					LEFT JOIN Profiles p1 on Messages.sender = p1.ID
					LEFT JOIN Profiles p2 on Messages.recipient = p2.ID
					WHERE Messages.recipient = ?
					AND Messages.status = '0'";
				break;
			default:
				$sql = "SELECT Messages.*, 
					CONCAT(p1.firstname,' ',p1.lastname) AS sendername,
					CONCAT(p2.firstname,' ',p2.lastname) AS recipientname
					FROM Messages
					LEFT JOIN Profiles p1 on Messages.sender = p1.ID
					LEFT JOIN Profiles p2 on Messages.recipient = p2.ID
					WHERE Messages.sender = ? OR Messages.recipient = ?";
		}
	
		//
		$query = $conn->prepare($sql);
		$query->bind_param('ii',$_GET['user'],$_GET['user']);
		$query->execute();
		echo json_encode(get_result($query));
			
		//
		$query = $conn->prepare(
			"Update Messages SET status = '1'
			WHERE Messages.recipient = ?
			AND Messages.status = '0'"
		);
		$query->bind_param('i',$_GET['user']);
		$query->execute(); break;
	case "POST":
		$query = $conn->prepare(
			"INSERT INTO Messages (message, recipient, sender, status) 
			VALUES (?,?,?,0)"
		);
		$query->bind_param('sii',
			$_POST['message'],
			$_POST['recipient'],
			$_POST['sender']
		);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id);
		
		// check recipient email
		$query = $conn->prepare("SELECT email FROM Profiles WHERE ID = ? LIMIT 1");
		$query->bind_param('i',$_POST['recipient']);
		$query->execute();
		$query->store_result();
		$query->bind_result($email);
		$query->fetch();
		$query->free_result();
		$query->close();
		
		
		// check sendername
		$query = $conn->prepare("SELECT username FROM Profiles WHERE ID = ? LIMIT 1");
		$query->bind_param('i',$_POST['sender']);
		$query->execute();
		$query->store_result();
		$query->bind_result($sendername);
		$query->fetch();
		$query->free_result();
		$query->close();
		
		// email new message
		$message = $_POST['message'];
		$subject = "Message from TeamHearing";
		$message = 'You have a new message from ' . $sendername . ' at TeamHearing.'
		. '<p>' . $message . ' -' . $sendername . '<p>'
		. '<form action="https://www.teamhearing.org">'
		. '<input style="font-weight:bold" type="submit" value="Go to TeamHearing" /></form>';
		$headers = "From: TeamHearing <noreply@teamhearing.org>\r\n";
		$headers .= "Reply-To: <bionicear-l@usc.edu>\r\n";
		$headers .= "MIME-Version: 1.0\r\n";
		$headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";
		mail($email,$subject,$message,$headers); 
		echo json_encode($email);echo json_encode($subject);echo json_encode($message);echo json_encode($headers);
		break;
	case "PUT":
		parse_str(file_get_contents("php://input"),$_PUT);
		
		$query = $conn->prepare(
			"UPDATE Messages SET sender = ?, recipient = ?, message = ?
			WHERE ID = ?"
		);
		$query->bind_param('iisi',
			$_PUT['sender'],
			$_PUT['recipient'],
			$_PUT['message'],
			$_PUT['ID']
		);
		$query->execute();
		$query->close();
		echo json_encode($conn->insert_id); break;
	case "DELETE":
		parse_str(file_get_contents("php://input"),$_DELETE);
		
		$query = $conn->prepare("DELETE FROM Messages WHERE ID = ?");
		$query->bind_param('i',$_DELETE['ID']);
		$query->execute();
		echo json_encode($query->affected_rows);
		$query->close();
}
?>