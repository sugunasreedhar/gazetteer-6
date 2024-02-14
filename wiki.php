<?php
if (isset($_POST['selectedCountry'])) {
    $selectedCountry = $_POST['selectedCountry'];

 
    // API endpoint for getting weather data by city name (country name in this case)
    $apiEndpoint = "http://api.geonames.org/wikipediaSearch?q={$selectedCountry}&maxRows=10&username=johnmicheal2023";

    // Initialize cURL session
    $ch = curl_init($apiEndpoint);

    // Set cURL options to return the response as a string
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // Execute the cURL session and get the JSON response
    $response = curl_exec($ch);
  
    // Check for cURL errors
    if (curl_errno($ch)) {
        echo 'Curl error: ' . curl_error($ch);
        exit;
    }

   

    // Validate and parse the JSON response
    // $weatherData = json_decode($response, true);

    if ($response === false) {
        echo json_encode(array('error' => 'Failed to fetch data'));
    } else {
        echo $response;
    }
 // Close cURL session
    curl_close($ch);
} else {
    echo "Selected country not provided.";
}
?>
