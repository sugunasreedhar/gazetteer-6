<?php
// $countryName = $_POST['q'];
$countryCode = $_POST['q'];
// $restCountriesDetail = "https://restcountries.com/v3.1/name/" . $countryName;
$restCountriesDetail = "https://restcountries.com/v3.1/alpha/" . $countryCode;

$curl = curl_init($restCountriesDetail);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($curl);
if ($response === false) {
    echo json_encode(array('error' => 'Failed to fetch data'));
} else {
    echo $response;
}

curl_close($curl);
?>
