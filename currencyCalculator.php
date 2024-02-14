<?php

// Currency you want to convert from (Base currency)
$base_currency = 'USD';

// Currency you want to convert to (Target currency)
$target_currency = $_GET['target_currency'];

// Check if the 'amount' parameter is set in the GET request
$amount = isset($_GET['amount']) ? floatval($_GET['amount']) : 1; // Default to 1 if not provided

// API URL
$url = "https://api.frankfurter.app/latest?amount=" . $amount . "&from=" . $target_currency . "&to=USD";

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

if (isset($data['rates']['USD'])) {
    $usd_value = $data['rates']['USD'];
    echo $usd_value;
} else {
    if (isset($data['message']) && $data['message'] === 'not found') {
        echo "Exchange rate not found for {$target_currency}";
    } else {
        echo " API Response: " . $response;
    }
}
?>
