<?php
include_once 'connection.php';

// create table
$tablename = 'Sequence';
$sql = "create table $tablename
(
	ID int not null auto_increment,
	primary key(ID),
  entry date,
	mode int,
  score int,
  level int,
  user int,
	subuser int
)";

// run sql and report
if(mysqli_query($conn,$sql)){echo "Table $tablename created successfully.<br>";}
else{echo mysqli_error($conn).".<br>";return;}

// close connection
$conn->close();
?>