<?php
include_once 'connection.php';

// create table
$tablename = 'playlist';
$sql = "create table $tablename
(
	ID int not null auto_increment,
	primary key(ID),
  entry date,
	indices varchar(64),
	difficulty enum('easy', 'medium', 'hard),
	mode enum('speech', 'music'),
  subuser int,
	user int,
	unique(date, indices, subuser, user)
)";

// run sql and report
if(mysqli_query($conn,$sql)){echo "Table $tablename created successfully.<br>";}
else{echo mysqli_error($conn).".<br>";return;}

// close connection
$conn->close();
?>