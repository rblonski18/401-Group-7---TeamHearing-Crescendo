<?php 
	session_start();
	
	// Unset all of the session variables.
	unset($_SESSION["u_id"]);
	unset($_SESSION["u_name"]);
	unset($_SESSION["u_role"]);
	unset($_SESSION["iPaduser"]);
	unset($_SESSION["PHPSESSID"]);
	$_SESSION = array();
	
	// If it's desired to kill the session, also delete the session cookie.
	// Note: This will destroy the session, and not just the session data!
	if (ini_get("session.use_cookies")) {
		$params = session_get_cookie_params();		
		setcookie('u_id', NULL, time()-3600);
		setcookie('u_name', NULL, time()-3600);
		setcookie('u_role', NULL, time()-3600);
		setcookie('iPaduser', NULL, time()-3600);
		setcookie('PHPSESSID', NULL, time()-3600);
	}
	$_SESSION['u_name']="";
	$_SESSION['u_id']=""; 
	$_SESSION['u_role']=""; 
	session_destroy();
	
?>