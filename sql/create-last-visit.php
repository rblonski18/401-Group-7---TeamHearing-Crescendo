<?php
// create table
$tablename = 'LastVisit';
$sql = "CREATE TABLE $tablename
(
  ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `date` DATE NOT NULL,
  `user` INT NOT NULL
)";
if(mysqli_query($connection,$sql)){echo "Table $tablename created successfully.<br>";}
else{echo mysqli_error($connection).".<br>";}
?>
