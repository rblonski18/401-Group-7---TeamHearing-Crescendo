<?php
// create table
$tablename = 'Indices';
$sql = "CREATE TABLE $tablename
(
  ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `user` INT NOT NULL,
  `index` INT NOT NULL
)";
if(mysqli_query($connection,$sql)){echo "Table $tablename created successfully.<br>";}
else{echo mysqli_error($connection).".<br>";}
?>
