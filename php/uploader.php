<?php
include_once 'connection.php';

//
$p_data = implode('', file('php://input'));
$p_data = explode('&', $p_data);
$filesgallery = "";
		
// upload file
$upload_file = basename( $_FILES['uploadedfile']['name']);
$target_path = "uploads/";
$target_path = $target_path . $upload_file; 
if(move_uploaded_file($_FILES['uploadedfile']['tmp_name'], $target_path)) {
	$filesgallery = $filesgallery .  "The file ".  $upload_file . " has been uploaded.";
	//insert record in tbl_files for the file uploaded
	$sqlfiles = "INSERT INTO Files (filename) VALUES ('$upload_file')";
	$resultfiles = mysql_query($sqlfiles);
} else{
	$filesgallery = $filesgallery .  "There was an error uploading the file, please try again!" . $sqlfiles;
}
$filesgallery = $filesgallery .  "<br />";
$filesgallery = $filesgallery .  "<br />";

//echo $filesgallery;
redirect('https://www.teamhearing.org/', '303');

function redirect($url, $statusCode)
{
   header('Location: ' . $url, true, $statusCode);
   die();
}

?>