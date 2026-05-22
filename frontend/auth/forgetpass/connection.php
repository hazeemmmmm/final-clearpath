<?php
$localhost = "localhost";
$username = "root";
$password = "";
$database = "team1";

$connect = mysqli_connect($localhost , $username , $password , $database);
session_start();

// if($connect){
//     echo"done";
// }
?>