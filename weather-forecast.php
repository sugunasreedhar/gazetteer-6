<?php

if (isset($_POST['selectedCountry'])) {
    $selectedCountry = $_POST['selectedCountry'];
    // $selectedCountry = "Pakistan";

    // OpenWeatherMap API key
    $apiKey = '6bd5b850178e2134497c4b965fbaf54e';

    // Function to fetch weather data from OpenWeatherMap
    function getWeatherData($url) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);

        return json_decode($response, true);
    }

    // Get current weather data
    $currentWeatherUrl = "https://api.openweathermap.org/data/2.5/weather?q={$selectedCountry}&units=metric&appid={$apiKey}";
    $currentWeatherData = getWeatherData($currentWeatherUrl);

    // Get forecast data
    $forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q={$selectedCountry}&units=metric&appid={$apiKey}";
    $forecastData = getWeatherData($forecastUrl);

    // Combine current weather and forecast data
    $weatherData = array(
        'current' => $currentWeatherData,
        'forecast' => $forecastData
    );

    // Return JSON response
    header('Content-Type: application/json');
    echo json_encode($weatherData);
} else {
    echo "Invalid request";
}
?>
