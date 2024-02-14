<?php
 
// Your Open Exchange Rates API Key
$api_key = '9f6e42732a914f189afb4c4cbb411fd4';

// Currency you want to convert from (Base currency)
$base_currency = 'USD';

// Currency you want to convert to (Target currency)
$target_currency = $_GET['target_currency'];

// API URL
$url = "https://openexchangerates.org/api/latest.json?app_id={$api_key}&base={$base_currency}";

// Initialize cURL session
$ch = curl_init($url);

// Set cURL options
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Execute the cURL session and get the JSON response
$response = curl_exec($ch);

// Check for cURL errors
if (curl_errno($ch)) {
    echo 'Curl error: ' . curl_error($ch);
    exit;
}

// Close cURL session
curl_close($ch);

// Decode the JSON response
$data = json_decode($response, true);

if (isset($data['rates'][$target_currency])) {
    $exchange_rate = $data['rates'][$target_currency];
    echo "1 {$base_currency} = {$exchange_rate} {$target_currency}";
} else {
    echo "Exchange rate not found for {$target_currency}";
    echo "API Response: " . $response;
}
?>
