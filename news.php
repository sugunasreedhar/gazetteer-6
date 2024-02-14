<?php

$api_key = 'pub_329013b2f826ab06a4d8d3fd1ce1970512e9e';
$countryCode = strtolower($_POST['selectedCountry']);

$url = "https://newsdata.io/api/1/news?apikey={$api_key}&country={$countryCode}";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'Gazetteer/1.0');

$response = curl_exec($ch);

// Check for cURL errors
if (curl_errno($ch)) {
    echo json_encode(array('error' => 'Curl error: ' . curl_error($ch)));
    exit;
}

// Check HTTP status code
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($httpCode !== 200) {
    echo json_encode(array('error' => 'HTTP error: ' . $httpCode));
    exit;
}

// Check if the response is not empty
if (empty($response)) {
    echo json_encode(array('error' => 'Empty response'));
} else {
    echo $response;
}

curl_close($ch);

?>
