<?php
// create table
$tablename = 'Sequence';
$sql = "CREATE TABLE $tablename
(
  ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `mode` INT NOT NULL,
  `level` INT NOT NULL,
  `score` INT NOT NULL,
  `user` INT NOT NULL,
  `subuser` INT NOT NULL
)";
if(mysqli_query($connection,$sql)){echo "Table $tablename created successfully.<br>";}
else{echo mysqli_error($connection).".<br>";}
?>
