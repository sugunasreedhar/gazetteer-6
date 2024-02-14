<?php
// Sample array

$json_data = file_get_contents('countryBorders.geo.json');
$data = json_decode($json_data, true);

// $data = array("a" => "Apple", "b" => "Ball", "c" => "Cat");

header("Content-Type: application/json");
echo $data;
exit();
?>