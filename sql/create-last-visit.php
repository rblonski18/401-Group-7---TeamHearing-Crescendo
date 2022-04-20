<?php
// create table
$tablename = 'LastVisit';
$sql = "CREATE TABLE LastVisit (
  ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  day DATE NOT NULL,
  user INT NOT NULL UNIQUE,
  ind TEXT NOT NULL
)";
if(mysqli_query($connection,$sql)){echo "Table $tablename created successfully.<br>";}
else{echo mysqli_error($connection).".<br>";}
?>
