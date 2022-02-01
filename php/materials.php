<?php 

// DB access script
include_once 'teamhearing_db_connect.php';

//
$material = $_POST['material'];

$sql="";
switch ($material) {
	case "BEL Sentences":
		$sql = "SELECT * FROM tbl_material_bel ORDER BY RAND() LIMIT 10";
		break;
	case "Seeing and Hearing Speech":
		$testkey = $_POST['tkey'];
		$setting1 = substr($testkey,0,2); //material
		$setting2 = substr($testkey,2,2); //material set
		$setting3 = intval(substr($testkey,4,2)); //subset 1
		$setting4 = intval(substr($testkey,6,2)); //subset 2 or question type
		$questiontype = 0; //0 for word alone, 1 for simple sentence, 2 for complex sentence
		$itemlimit = 0;
		$settype = "";
		$setgroupname = "";
		switch ($setting2) {
			case "01": //Consonants
				$activityid = 4;
				$itemlimit = 40;
				switch ($setting3) {
					case "01": $settype="PBM front"; break;
					case "02": $settype="PBM back"; break;
					case "03": $settype="FV front"; break;
					case "04": $settype="FV back"; break;
					case "05": $settype="WR front"; break;
					case "06": $settype="TDNLSZ front"; break;
					case "07": $settype="TDNLSZ back"; break;
					case "08": $settype="CHJSH front"; break;
					case "09": $settype="CHJSH back"; break;
					case "10": $settype="KGNGYH front"; break;
					case "11": $settype="KGNGYH back"; break;
				}
				$sql = "SELECT * FROM tbl_material_shs WHERE activityid='".$activityid."' AND settype ='".$settype."' ORDER BY RAND() LIMIT $itemlimit";
				break;
			case "02": //SHS Vowels
				$activityid = 3;
				$itemlimit = 20;
				switch ($setting3) {
					case "01": $settype = "Round Lip"; break;
					case "02": $settype = "Spread Lip"; break;
					case "03": $settype = "Relaxed Lip"; break;
				}
				$sql="SELECT * FROM tbl_material_shs WHERE activityid='".$activityid."' AND settype ='".$settype."' ORDER BY RAND() LIMIT $itemlimit";
				break;
			case "03": //Everyday Communication
				$activityid = 12;
				$itemlimit = 12;
				switch ($setting3) {
					case "01": $settype = "Sentence Topics"; break;
					case "02": $settype = "Common Phrases"; break;
					case "03": $settype = "Related Words"; break;
					case "04": $settype = "Name Recognition"; break;
				}
				$sql="SELECT * FROM tbl_material_shs WHERE activityid='".$activityid."' AND settype ='".$settype."' ORDER BY RAND() LIMIT $itemlimit";
				break;
			case "04": //Name Recognition
				$activityid = 10;
				$itemlimit = 12;
				$settype = "Name Recognition";
				switch ($setting3) {
					case "01": $setgroupname = "Set A"; break;
					case "02": $setgroupname = "Set B"; break;
				}
				$sql="SELECT * FROM tbl_material_shs WHERE activityid='".$activityid."' AND settype ='".$settype."' AND setgroupname ='".$setgroupname."'ORDER BY RAND() LIMIT $itemlimit";
				break;					
			case "00": //this used to be 04
				$itemlimit=12;
				switch ($setting3) {
					case "01": $activityid=14; $settype = "Expansions"; break;
					case "02": $activityid=8; $settype = "Syllable Stress"; break;
					case "03": $activityid=5; $settype = "Word Stress"; break;
					case "04": $activityid=6; $settype = "Intonation"; break;
					case "05": $activityid=7; $settype = "Word Stress and Into"; break;
				}
				$sql="SELECT * FROM tbl_material_shs WHERE activityid='".$activityid."' AND settype ='".$settype."' ORDER BY RAND() LIMIT $itemlimit";
				break;
			}
			break;
	case "SPIN Sentences":
		$sql = "SELECT * FROM tbl_material_spin";
		switch ($materialSet) {
			case "Contextual": $sql = $sql . " WHERE activityid=2"; break;
			case "Nonsense": $sql = $sql . " WHERE activityid=1"; break;
			default: $sql = $sql . " WHERE activityid=1";
		}
		$sql = $sql . " LIMIT 12";
		break;
}

// Run the Query	
$result = mysql_query($sql);
$items = mysql_num_rows($result);
$foilrows = array();

//
if ($items > 0) {
	$success='y';
} else {
	$success='n';
}

//
if($success=='y') {
	$msg_status = 'Data for $requested retrieved.  ';
	$allrows = array(); //container for original results set
	while($r = mysql_fetch_assoc($result)) {
		$allrows[] = $r;
	}
	print json_encode($allrows);	
} else {
	$msg_status = 'Error in retrieving $requested data.  ';
	print json_encode(array('success' => $success, 'carecategoryview' => $carecategoryview, 'msg_status' => $msg_status)); 
}
?>