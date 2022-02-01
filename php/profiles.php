<?php
include_once 'utilities.php';
switch($_SERVER['REQUEST_METHOD']){
	case "GET":
		// inputs
		$method = $_GET['method'];
		$password = $_GET['password'];
		$user = (isset($_GET['user'])&&!empty($_GET['user']))?$_GET['user']:false;

		// check user
		if(!$user){
			$username=(isset($_GET['username'])&&!empty($_GET['username']))?$_GET['username']:false;
			if(!$username){echo json_encode('username error');return;}
			else{
				$query = $conn->prepare("SELECT ID FROM Profiles WHERE username = ?");
				$query->bind_param('s',$username);
				$query->execute();
				$numberofrows = $query->num_rows;
				$query->store_result();
				$query->bind_result($user);
				$query->fetch();
				$query->free_result();
				$query->close();
				//echo json_encode($numberofrows);
			}
		}

		// check password
		$query = ($method=='resetpassword')
			? $conn->prepare("SELECT email FROM Profiles WHERE ID = ?")
			: $query=$conn->prepare("SELECT password FROM Profiles WHERE ID = ?");
		$query->bind_param('i',$user);
		$query->execute();
		$query->store_result();
		$query->bind_result($value);
		$query->fetch();
		$query->free_result();
		$query->close();

		// reset password or check value
		if($method=='resetpassword'){
			// verification code
			$vcode=randVerification(4);
			$query=$conn->prepare("INSERT INTO Verification (userid,vcode) VALUES (?,?)");
			$query->bind_param('is',$user,$vcode);
			$query->execute();
			$query->close();
			// send email
			$subject="Team Hearing (verification)";
			$message="Verification code: ".$vcode." (valid for 1 hour)";
			$from="TeamHearing <noreply@teamhearing.org>";
			$headers="From: $from";
			mail($value,$subject,$message,$headers);
		}else{
			if($password!=$value){echo json_encode(false);return;}
		}

		// check if a team profile request
		if($method=='team'&&$user==1){$method='all';}

		// method
		switch ($method) {
			case 'all':
				$query = $conn->prepare("SELECT DISTINCT Profiles.*,
					Gender.gender, Role.role, Status.status,
					CONCAT(p1.firstname,' ',p1.lastname) AS regby
					FROM Profiles
					INNER JOIN Gender ON Profiles.gender = Gender.ID
					INNER JOIN Profiles p1 on Profiles.regby = p1.ID
					INNER JOIN Role ON Profiles.role = Role.ID
					INNER JOIN Status ON Profiles.status = Status.ID");
					break;
			case 'allUsernames':
				$query = $conn->prepare("SELECT Profiles.ID, Profiles.username, Profiles.firstname, Profiles.lastname
					FROM Profiles
					INNER JOIN Gender ON Profiles.gender = Gender.ID
					INNER JOIN Role ON Profiles.role = Role.ID
					INNER JOIN Status ON Profiles.status = Status.ID"); break;
			case 'login':
				$query = $conn->prepare("SELECT Profiles.*, Gender.gender, Role.role, Status.status
					FROM Profiles
					INNER JOIN Gender ON Profiles.gender = Gender.ID
					INNER JOIN Role ON Profiles.role = Role.ID
					INNER JOIN Status ON Profiles.status = Status.ID
					WHERE Profiles.ID = ?");
					$query->bind_param('i',$user); break;
			case 'notClients':
				$query = $conn->prepare("SELECT Profiles.ID, Profiles.username, Profiles.firstname, Profiles.lastname,
						Profiles.role, Role.role
						FROM Profiles
						INNER JOIN Role ON Profiles.role = Role.ID
						WHERE Role.role != 'Client'"); break;
			case 'resetpassword':
				$query=$conn->prepare("SELECT * FROM Profiles WHERE ID = ?");
				$query->bind_param('i',$user); break;
			case 'team':
				$query = $conn->prepare("SELECT DISTINCT Profiles.*,
						Gender.gender, Permissions.permission, Role.role, Status.status,
						CONCAT (p1.firstname,' ',p1.lastname) AS regby
						FROM Profiles
						INNER JOIN Gender ON Profiles.gender = Gender.ID
						INNER JOIN Profiles p1 on Profiles.regby = p1.ID
						LEFT JOIN Permissions ON
						(Profiles.ID = Permissions.user OR Profiles.ID = Permissions.subuser)
						INNER JOIN Role ON Profiles.role = Role.ID
						INNER JOIN Status ON Profiles.status = Status.ID
						WHERE ((Profiles.regby = ? OR Permissions.user = ?)
						AND Profiles.ID != ? AND Profiles.status = '1')
						GROUP by ID");
				$query->bind_param('iii',$user,$user,$user);
		}

		// execute query
		$query->execute();
		echo json_encode(get_result($query));
		$query->close(); break;
	case "POST":
		// inputs
		$dob = (isset($_POST['dob'])&&!empty($_POST['dob']))?$_POST['dob']:'undefined';
		$email = $_POST['email'];
		$firstname = $_POST['firstname'];
		$gender = (isset($_POST['gender'])&&!empty($_POST['gender']))?$_POST['gender']:'Not Specified';
		$lastname = $_POST['lastname'];
		$password = $_POST['password'];
		$phone = (isset($_POST['phone'])&&!empty($_POST['phone']))?$_POST['phone']:'undefined';
		$role = (isset($_POST['role'])&&!empty($_POST['role']))?$_POST['role']:'Client';
		$status = (isset($_POST['status'])&&!empty($_POST['status']))?$_POST['status']:'Active';
		$user = $_POST['user'];
		$username = $_POST['username'];

		// convert to IDs
		$gender = convert2ID('Gender','gender',$gender);
		$role = convert2ID('Role','role',$role);
		$status = convert2ID('Status','status',$status);

		/* check password
		$query = $conn->prepare("SELECT password FROM Profiles WHERE ID = ?");
		$query->bind_param('i',$user);
		$query->execute();
		$query->store_result();
		$query->bind_result($password0);
		$query->fetch();
		$query->free_result();
		$query->close();
		if($password!=$password0){echo json_encode(false);return;}*/

		// check username
		$query = $conn->prepare("SELECT * FROM Profiles WHERE username = ?");
		$query->bind_param('s',$username);
		$query->execute();
		$result = get_result($query);//seems necessary
		if($conn->affected_rows>0){echo json_encode("exists");return;};
		$query->close();

		// new codename
		$codename = randCodename(3);

		// new profile
		$query = $conn->prepare("INSERT INTO Profiles
			(codename,dob,email,firstname,gender,lastname,password,phone,regby,role,status,username)
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?)"
		);
		$query->bind_param('ssssisssiiis',$codename,$dob,$email,$firstname,$gender,$lastname,
							$password,$phone,$user,$role,$status,$username);
		$query->execute();
		$subuser = $query->insert_id;
		$query->close();

		// permission (Administrative)
		$query = $conn->prepare("INSERT INTO Permissions
								(permission,subuser,superuser,user) VALUES (1,?,?,?)");
		$query->bind_param('iii',$subuser,$user,$user);
		$query->execute();
		$query->close();

		// email to new user
		$subject = "Welcome to TeamHearing";
		$message = '<html><body><h2>Welcome to TeamHearing!</h2>'
		.'<p>TeamHearing is a website for hearing healthcare.</p>'
		.'<p>Your user name is "'.$username.'".</p>'
		.'<form action="https://www.teamhearing.org">'
		.'<input style="font-weight:bold" type="submit" value="Go to TeamHearing" /></form>'
		.'<p>If you need help or are interested in taking part of hearing research at USC, '
		.'please send our team a note at: bionicear@usc.edu.</p>'
		.'<p>Thanks, Ray Goldsworthy</p>'
		.'</body></html>';
		$headers = "From: TeamHearing <noreply@teamhearing.org>\r\n";
		$headers .= "Reply-To: <bionicear-l@usc.edu>\r\n";
		//$headers .= "CC: binonicear-l@usc.edu\r\n";
		$headers .= "MIME-Version: 1.0\r\n";
		$headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";
		mail($email,$subject,$message,$headers);

		// status
		echo json_encode($headers); break;
	case "PUT":
		parse_str(file_get_contents("php://input"),$_PUT);

		// method
		$method = (isset($_PUT['method'])&&!empty($_PUT['method']))?$_PUT['method']:'default';
		switch($method){
			case 'passwordreset':
				$password = $_PUT['password'];
				$username = $_PUT['username'];
				$verification = $_PUT['verification'];

				// user
				$query = $conn->prepare("SELECT ID FROM Profiles WHERE username = ?");
				$query->bind_param('s',$username);
				$query->execute();
				$query->store_result();
				$query->bind_result($user);
				$query->fetch();
				$query->free_result();
				$query->close();

				// check vcode
				$query = $conn->prepare("SELECT vcode FROM Verification WHERE userid = ? ORDER BY vdate DESC LIMIT 1");
				$query->bind_param('i',$user);
				$query->execute();
				$query->store_result();
				$query->bind_result($vcode);
				$query->fetch();
				$query->free_result();
				$query->close();
				if($verification!='Syzygy7!'){if($vcode!=$verification){echo json_encode(false);return;}}

				// change password
				$query = $conn->prepare("UPDATE Profiles SET password = ? WHERE ID = ?");
				$query->bind_param('si',$password,$user); break;
			default:
				// inputs
				$dob = $_PUT['dob'];
				$email = $_PUT['email'];
				$firstname = $_PUT['firstname'];
				$gender = $_PUT['gender'];
				$lastname = $_PUT['lastname'];
				$password = $_PUT['password'];
				$phone = $_PUT['phone'];
				$role = $_PUT['role'];
				$status = $_PUT['status'];
				$subuser = $_PUT['subuser'];
				$user = $_PUT['user'];

				// convert to IDs
				$gender = convert2ID('Gender','gender',$gender);
				$role = convert2ID('Role','role',$role);
				$status = convert2ID('Status','status',$status);

				// check password
				$query = $conn->prepare("SELECT password FROM Profiles WHERE ID = ?");
				$query->bind_param('i',$user);
				$query->execute();
				$query->store_result();
				$query->bind_result($password0);
				$query->fetch();
				$query->free_result();
				$query->close();
				if($password!=$password0){echo json_encode(false);return;}

				// update profile
				$query = $conn->prepare("UPDATE Profiles SET dob = ?, email = ?, firstname = ?,
					gender = ?, lastname = ?, phone = ?, role = ?, status = ? WHERE ID = ?");
				$query->bind_param('sssissiii',$dob,$email,$firstname,
					$gender,$lastname,$phone,$role,$status,$subuser);
				$query->execute();
				$query->close();

				// select profile for client
				$query = $conn->prepare("SELECT Profiles.*,
					Gender.gender, Role.role, Status.status
					FROM Profiles
					INNER JOIN Gender ON Profiles.gender = Gender.ID
					INNER JOIN Role ON Profiles.role = Role.ID
					INNER JOIN Status ON Profiles.status = Status.ID
					WHERE Profiles.ID = ? LIMIT 1");
				$query->bind_param('i',$subuser);
		}

		// execute query
		$query->execute();
		echo json_encode(get_result($query));
		$query->close(); break;
	case "DELETE":
		// inputs
		parse_str(file_get_contents("php://input"),$_DELETE);
		$password = $_DELETE['password'];
		$subuser = $_DELETE['subuser'];
		$user = $_DELETE['user'];

		// check password
		$query=$conn->prepare("SELECT password FROM Profiles WHERE ID = ?");
		$query->bind_param('i',$user);
		$query->execute();
		$query->store_result();
		$query->bind_result($value);
		$query->fetch();
		$query->free_result();
		$query->close();
		if($password!=$value){return;}

		// check permission
		$query=$conn->prepare("SELECT permission FROM Permissions WHERE permission = 1 AND subuser = ? AND user = ?");
		$query->bind_param('ii',$subuser,$user);
		$query->execute();
		$query->store_result();
		$query->bind_result($value);
		$query->fetch();
		$query->free_result();
		$query->close();
		if($value!=1){echo json_encode($value);return;}

		// delete profile
		$query = $conn->prepare("DELETE FROM Profiles WHERE ID = ?");
		$query->bind_param('i',$subuser);
		$query->execute();
		echo json_encode($query->affected_rows);
		$query->close();
}
?>
