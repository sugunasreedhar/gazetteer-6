if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(function (position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
    });
}

$(document).ready(function () {

    $('.btn-close').on('click', function () {
        var modal = $(this).closest('.modal');

        modal.modal('hide');
    });

    const accessToken = 'mp7HpF6CTTab9XpRyyepuWcxb0csyu4kTS74Jx2iLGHnM7RsR2kkmnEz3vWCLjRq';
    let tileLayer;
    let currentMarker;
    let countryBordersLayer;

    const streets = L.tileLayer.provider('Esri.WorldStreetMap');
    const satellite = L.tileLayer.provider('Esri.WorldImagery');

    var basemaps = {
        "Streets": streets,
        "Satellite": satellite
    };

    const map = L.map("map", {
        layers: [streets]
    }).setView([54.5, -4], 6);


    var airports = L.markerClusterGroup({
        polygonOptions: {
            fillColor: '#fff',
            color: '#000',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.5
        }
    }).addTo(map);

    var cities = L.markerClusterGroup({
        polygonOptions: {
            fillColor: '#fff',
            color: '#000',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.5
        }
    }).addTo(map);

    var overlays = {
        "Airports": airports,
        "Cities": cities
    };

    var layerControl = L.control.layers(basemaps, overlays).addTo(map);

    function showUserLocationAndBorder() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
                    .then(response => response.json())
                    .then(data => {
                        const isoCode = data.address.country_code.toUpperCase();
                        displayCountryBorders(isoCode);
                        showUserLocation(position);
                    })
                    .catch(error => console.error("Error fetching location data:", error));
            });
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    }

    showUserLocationAndBorder();

    async function getCities(isoCode) {
        cities.clearLayers();
        const username = 'sugunasr';
        const geoNamesUrl = `http://api.geonames.org/searchJSON?formatted=true&country=${isoCode}&q=city&&maxRows=30&lang=en&username=${username}`;
        
        $.ajax({
            url: geoNamesUrl,
            type: 'GET',
            dataType: 'json',
            success: function (result) {
                result.geonames.forEach(function (item) {
                    if(item.fcode === 'PPL' || item.fcode === 'PPLA' || item.fcode === 'PPLA2' || item.fcode === 'PPLA3') {
                        const cityMarker = L.icon({
                            iconUrl: "images/icons/city-icon.png",
                            iconSize: [38, 38]
                        });
                        L.marker([item.lat, item.lng], { icon: cityMarker })
                            .bindTooltip(item.name, { direction: 'top', sticky: true })
                            .addTo(cities);
                    }
                });
            },
            error: function (xhr, status, error) {
                console.error("Error fetching data from GeoNames API:", error);
            }
        });
    }

    async function getAirports(isoCode) {
        airports.clearLayers();
        const username = 'sugunasr';
        const geoNamesUrl = `http://api.geonames.org/searchJSON?formatted=true&country=${isoCode}&q=airport&maxRows=30&lang=en&username=${username}`;
        
        $.ajax({
            url: geoNamesUrl,
            type: 'GET',
            dataType: 'json',
            success: function (result) {
                result.geonames.forEach(function (item) {
                    if (item.fcode === 'AIRP') {
                        const markerIcon = L.icon({
                            iconUrl: "images/icons/airport-icon.png",
                            iconSize: [38, 38]
                        });
                        L.marker([item.lat, item.lng], { icon: markerIcon })
                            .bindTooltip(item.name, { direction: 'top', sticky: true })
                            .addTo(airports);
                    }
                });
            },
            error: function (xhr, status, error) {
                console.error("Error fetching data from GeoNames API:", error);
            }
        });
    }
    


    function showUserLocation(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
            .then(response => response.json())
            .then(data => {
                const countryName = data.address.country;
                const selectCountry = document.getElementById('selectedCountry');
                const isoCode = data.address.country_code.toUpperCase();

                for (const option of selectCountry.options) {
                    if (option.value === isoCode) {
                        option.selected = true;
                        break;
                    }
                }

                const loadingElement = document.querySelector('.loading');
                loadingElement.style.display = 'none';

                map.setView([latitude, longitude], 10);

                if (!tileLayer) {
                    tileLayer = L.tileLayer(
                        `https://tile.jawg.io/jawg-streets/{z}/{x}/{y}.png?access-token=${accessToken}`, {
                        attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank" class="jawg-attrib">&copy; <b>Jawg</b>Maps</a> | <a href="https://www.openstreetmap.org/copyright" title="OpenStreetMap is open data licensed under ODbL" target="_blank" class="osm-attrib">&copy; OSM contributors</a>',
                        maxZoom: 50
                    }
                    ).addTo(map);
                }
                getCities(isoCode);
                getAirports(isoCode);
            })
            .catch(error => console.error("Error fetching location data:", error));

    }

    function displayCountryBorders(selectedIsoCode) {
        if (countryBordersLayer) {
            map.removeLayer(countryBordersLayer);
        }

        fetch('JSONdata/countryBorders.geo.json')
            .then(response => response.json())
            .then(data => {
                data.features.sort((a, b) => {
                    var nameA = a.properties.name.toUpperCase();
                    var nameB = b.properties.name.toUpperCase();
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }
                    return 0;
                });
                var select = $('#selectedCountry');
                $.each(data.features, function (index, country) {
                    var isoCode = country.properties.iso_a2;
                    var countryName = country.properties.name;
                    select.append("<option value='" + isoCode + "' data-name='" + countryName + "'>" + countryName + "</option>");
                });
                const selectedCountryFeature = data.features.find(feature => feature.properties.iso_a2 === selectedIsoCode);
                if (selectedCountryFeature) {
                    countryBordersLayer = L.geoJSON(selectedCountryFeature).addTo(map);
                    map.fitBounds(countryBordersLayer.getBounds());
                }
            })
            .catch(error => console.error("Error loading country boundaries:", error));
    }

    const selectCountry = document.getElementById('selectedCountry');
    selectCountry.addEventListener('change', function () {
        const selectedIsoCode = this.value;
        displayCountryBorders(selectedIsoCode);

        fetch(`https://nominatim.openstreetmap.org/search?country=${selectedIsoCode}&format=json`)
            .then(response => response.json())
            .then(data => {
                if (data && data[0] && data[0].lat && data[0].lon) {
                    const latitude = parseFloat(data[0].lat);
                    const longitude = parseFloat(data[0].lon);
                    map.setView([latitude, longitude], 10);
                    getCities(selectedIsoCode);
                    getAirports(selectedIsoCode);

                }
            })
            .catch(error => console.error("Error fetching location data:", error));
    });


    const countryInfoButton = L.easyButton('fas fa-info', function () {
        const selectedCountry = $("#selectedCountry").val();
        if (!selectedCountry) {
            alert("Select the country first.");
            return;
        }

        if ($("#selectedCountry").val() == "") {
            alert("Select the country first.");
        } else {
            $(document).ajaxStart(function () {
                $(".loading").show();
            });

            $.ajax({
                url: "scripts/restCountries.php",
                type: "POST",
                dataType: "json",
                data: {
                    q: $("#selectedCountry").val(),
                },
                success: function (result) {
                    var languages = result.languages;
                    var currencies = result.currencies;
                    var population = new Intl.NumberFormat().format(result.population);
                    var countryName = result[0].name.common;
                    var countryFullName = result[0].name.official;
                    $("#region").html(result[0].region);
                    $("#sub-region").html(result[0].subregion);
                    $("#timezones").html(result[0].timezones[0]);
                    $("#general-info-title").html(countryName + '<br>' + countryFullName);
                    $("#capital-city").html(result[0].capital[0]);
                    $("#population").html(result[0].population.toLocaleString());
                    $("#country-flag").attr("src", result[0].flags.png);
                    var languagesInfo = "";
                    var languages = result[0].languages;
                    for (var languageCode in languages) {
                        if (languages.hasOwnProperty(languageCode)) {
                            var languageName = languages[languageCode];
                            languagesInfo += languageName + ' - ';
                        }
                    }

                    $("#languages-spoken").html(languagesInfo);

                    var currenciesInfo = "";
                    var currencies = result[0].currencies;

                    for (var currencyCode in currencies) {
                        if (currencies.hasOwnProperty(currencyCode)) {
                            var currency = currencies[currencyCode];
                            currenciesInfo += currency.name + ' - ' + currency.symbol + '<br>';
                        }
                    }

                    var currenciesData = result[0].currencies;
                    var currencyCode = Object.keys(currenciesData)[0];

                    $("#currencies").html(currenciesInfo);
                    $.ajax({
                        url: "scripts/currencyExchange.php",
                        type: "GET",
                        data: {
                            base_currency: "USD",
                            target_currency: currencyCode,
                        },
                        success: function (exchangeRate) {

                            $("#currenciesExchangeRate").html(exchangeRate);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log("Error fetching currency exchange rate");
                        },
                    });

                    $("#general-info-modal").modal("show");

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                    console.log(textStatus);
                    console.log(jqXHR);
                },
                complete: function () {
                    $(document).ajaxStop(function () {
                        $(".loading").hide();
                    });
                },
            });
        }

        displayModal("countryInfoModal");
    }).addTo(map);


    const weatherButton = L.easyButton('fas fa-cloud', function () {
        const selectedVal = $("#selectedCountry").val();
        var selectedOption = $("#selectedCountry").find(':selected');
        const selectedCountry = selectedOption.data('name');

        if (!selectedCountry) {
            alert("Select the country first.");
            return;
        }

        $(".loading").show();

        $.ajax({
            type: 'POST',
            url: 'scripts/weather-forecast.php',
            data: { selectedCountry: selectedCountry },
            dataType: 'json',
            success: function (data) {
                if (data && data.current && data.forecast) {
                    const weatherModal = $("#weatherModal");
                    const weatherInfo = $("#weather-info");
                    weatherInfo.empty();
                    displayCurrentWeather(data.current, weatherInfo);
                    displayForecast(data.forecast, weatherInfo);
                    weatherModal.modal("show");
                } else {
                    console.error("Invalid data format in the response");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error fetching weather data");
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
            },
            complete: function () {
                $(".loading").hide();
            }
        });

        displayModal("weatherModal");
    }).addTo(map);


    function displayCurrentWeather(currentWeather, weatherInfo) {
        weatherInfo.append(
            "<h3>" + currentWeather.name + "</h3>" +
            "<div style='display: flex; justify-content: space-between; align-items: center;'>" +
            "<div>" +
            "<p style='margin-bottom: 0; font-weight: bold; font-size: 1rem;'>Today</p>" +
            "<p style='text-transform: capitalize; font-size: 1rem; margin-bottom: 0;'>" + currentWeather.weather[0].description + "</p>" +
            "</div>" +
            "<div style='display: flex; align-items: center;'>" +
            "<img src='https://openweathermap.org/img/w/" + currentWeather.weather[0].icon + ".png' style='width: 80px; height: 80px;' />" +
            "<div style='width: 40px; text-align: center;'>" +
            "<p style='margin-bottom: 0; font-weight: bold; font-size: 1rem;'>" + Math.round(currentWeather.main.temp_max) + "&deg;C</p>" +
            "<p style='font-size: 1rem; margin-bottom: 0;'>" + Math.round(currentWeather.main.temp_min) + "&deg;C</p>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "<hr style='margin: 0;'>"
        );
    }

    function displayForecast(forecastData, weatherInfo) {
        weatherInfo.find('.ow-row.ow-forecast').empty();
        let uniqueDays = [];
        let dayCount = 0;
        for (let i = 0; i < forecastData.list.length; i++) {
            let forecastItem = forecastData.list[i];
            let forecastDate = dayjs(forecastItem.dt_txt); // Use dayjs to parse the date
            let forecastDay = forecastDate.format('dddd, MMMM D'); // Format the date

            if (!uniqueDays.includes(forecastDay) && dayCount < 2) {
                let forecastDescription = forecastItem.weather[0].description;
                let forecastIcon = forecastItem.weather[0].icon;
                let forecastTempMax = Math.round(forecastItem.main.temp_max);
                let forecastTempMin = Math.round(forecastItem.main.temp_min);

                weatherInfo.append(
                    "<div style='display: flex; justify-content: space-between; align-items: center;'>" +
                    "<div>" +
                    "<p style='margin-bottom: 0; font-weight: bold; font-size: 1rem;'>" + forecastDay + "</p>" +
                    "<p style='text-transform: capitalize; font-size: 1rem; margin-bottom: 0;'>" + forecastDescription + "</p>" +
                    "</div>" +
                    "<div style='display: flex; align-items: center;'>" +
                    "<img src='https://openweathermap.org/img/w/" + forecastIcon + ".png' style='width: 80px; height: 80px;' />" +
                    "<div style='width: 40px; text-align: center;'>" +
                    "<p style='margin-bottom: 0; font-weight: bold; font-size: 1rem;'>" + forecastTempMax + "&deg;C</p>" +
                    "<p style='font-size: 1rem; margin-bottom: 0;'>" + forecastTempMin + "&deg;C</p>" +
                    "</div>" +
                    "</div>" +
                    "</div>" +
                    "<hr style='margin: 0;'>"
                );

                uniqueDays.push(forecastDay);
                dayCount++;
            }
        }
    }


    const wikiButton = L.easyButton('fas fa-book', function () {
        const selectedCountry = $("#selectedCountry").val();
        if (!selectedCountry) {
            alert("Select the country first.");
            return;
        }

        if ($("#selectedCountry").val() == "") {
            alert("Select the country first.");
        } else {
            $(".loading").show();

            $.ajax({
                url: "scripts/wiki.php",
                type: "POST",
                dataType: "xml",
                data: {
                    selectedCountry: $("#selectedCountry").val(),
                },
                success: function (result) {

                    const wikiModal = $("#wikiModal");
                    const wikiInfo = $("#wiki-info");

                    wikiInfo.empty();

                    $(result).find('entry').each(function () {
                        const title = $(this).find('title').text();
                        const summary = $(this).find('summary').text();
                        const feature = $(this).find('feature').text();
                        const countryCode = $(this).find('countryCode').text();
                        const elevation = $(this).find('elevation').text();
                        const lat = $(this).find('lat').text();
                        const lng = $(this).find('lng').text();
                        const wikipediaUrl = $(this).find('wikipediaUrl').text();
                        const thumbnailImg = $(this).find('thumbnailImg').text();
                        const entryDiv = $("<div>");
                        entryDiv.append("<h2>" + title + "</h2>");
                        entryDiv.append("<p><strong>Summary:</strong> " + summary + "</p>");
                        entryDiv.append("<p><strong>Feature:</strong> " + feature + "</p>");
                        entryDiv.append("<p><strong>Country Code:</strong> " + countryCode + "</p>");
                        entryDiv.append("<p><strong>Elevation:</strong> " + elevation + "</p>");
                        entryDiv.append("<img src='" + thumbnailImg + "' alt='Thumbnail Image'>");
                        entryDiv.append("<p><a href='" + wikipediaUrl + "' target='_blank' class='btn btn-dark'>Read More</a></p>");
                        wikiInfo.append(entryDiv);
                    });
                    wikiModal.modal("show");
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log("Error fetching wikipedia data");
                    console.log(jqXHR);
                    console.log(textStatus);
                    console.log(errorThrown);
                },
                complete: function () {
                    $(".loading").hide();
                },
            });
        }

        displayModal("wikiModal");
    }).addTo(map);


    const newsButton = L.easyButton('fas fa-newspaper', function () {
        const selectedCountry = $("#selectedCountry").val();
        if (!selectedCountry) {
            alert("Select the country first.");
            return;
        }

        if ($("#selectedCountry").val() == "") {
            alert("Select the country first.");
        } else {
            $(".loading").show();

            $.ajax({
                url: "scripts/news.php",
                type: "POST",
                dataType: "json",
                data: {
                    selectedCountry: $("#selectedCountry").val(),
                },
                success: function (response) {
                    $("#news-info").empty();
                    response.results.forEach(function (article) {
                        $("#news-info").append(
                            '<div class="news-item">' +
                            '<h5>' + article.title + '</h5>' +
                            '<small><b>Author:</b> ' + article.creator + '</small> | ' +
                            '<small><b>Published at</b> ' + article.pubDate + '</small>' +
                            '<p class="mt-2">' + article.description + '</p>' +
                            '<p><a href="' + article.link + '" class="btn btn-sm btn-dark" target="_blank">Read More</a></p>' +
                            '</div><hr>'
                        );
                    });

                    $("#newsModal").modal("show");

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log("Error fetching news data");
                    console.log(jqXHR);
                    console.log(textStatus);
                    console.log(errorThrown);
                },
                complete: function () {
                    $(".loading").hide();
                },
            });
        }

        displayModal("newsModal");
    }).addTo(map);

    function displayModal(modalId) {
        $(`#${modalId}`).modal('show');
        $(`#${modalId}`).addClass('show');
    }


    let targetCurrency;
    const currencyInfoButton = L.easyButton('fas fa-sync-alt', function () {
        const selectedCountry = $("#selectedCountry").val();
        if (!selectedCountry) {
            alert("Select the country first.");
            return;
        }

        if ($("#selectedCountry").val() == "") {
            alert("Select the country first.");
        } else {
            $(document).ajaxStart(function () {
                $(".loading").show();
            });

            $.ajax({
                url: "scripts/restCountries.php",
                type: "POST",
                dataType: "json",
                data: {
                    q: $("#selectedCountry").val(),
                },
                success: function (result) {
                    var currencies = result[0].currencies;
                    var currenciesInfo = "";
                    for (var currencyCode in currencies) {
                        if (currencies.hasOwnProperty(currencyCode)) {
                            var currency = currencies[currencyCode];
                            currenciesInfo += currency.name + ' - ' + currency.symbol + '<br>';
                        }
                    }

                    var currenciesData = result[0].currencies;
                    targetCurrency = Object.keys(currenciesData)[0];

                    $("#currency").html(currenciesInfo);

                    $("#currencyValue").val("1");

                    $.ajax({
                        url: "scripts/currencyCalculator.php",
                        type: "GET",
                        data: {
                            base_currency: "USD",
                            target_currency: targetCurrency,
                            amount: "1",
                        },
                        success: function (exchangeRate) {
                            $("#currencyExchangeRate").html(exchangeRate);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log("Error fetching currency exchange rate");
                        },
                    });

                    const debouncedFetchExchangeRate = _.debounce(function () {
                        const enteredValue = $("#currencyValue").val();

                        $.ajax({
                            url: "scripts/currencyCalculator.php",
                            type: "GET",
                            data: {
                                base_currency: "USD",
                                target_currency: targetCurrency,
                                amount: enteredValue,
                            },
                            success: function (exchangeRate) {
                                $("#currencyExchangeRate").html(exchangeRate);
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log("Error fetching currency exchange rate");
                            },
                        });
                    }, 1000);

                    $("#currencySelector").on("change", function () {
                        targetCurrency = $(this).val();
                        debouncedFetchExchangeRate();
                    });


                    $("#currencyValue").on("input", function () {
                        debouncedFetchExchangeRate();
                    });

                    $("#general-info-modal").modal("show");
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log("data not sent");
                    console.log(errorThrown);
                    console.log(textStatus);
                    console.log(jqXHR);
                },
                complete: function () {
                    $(document).ajaxStop(function () {
                        $(".loading").hide();
                    });
                },
            });
        }

        displayModal("currencyInfoModal");
    }).addTo(map);

});
