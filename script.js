const temp = document.getElementById("temp"),
  date = document.getElementById("date-time"),
  condition = document.getElementById("condition"),
  rain = document.getElementById("rain"),
  mainIcon = document.getElementById("icon"),
  currentLocation = document.getElementById("location"),
  uvIndex = document.querySelector(".uv-index"),
  uvText = document.querySelector(".uv-text"),
  windSpeed = document.querySelector(".wind-speed"),
  sunRise = document.querySelector(".sun-rise"),
  sunSet = document.querySelector(".sun-set"),
  humidity = document.querySelector(".humidity"),
  visibilty = document.querySelector(".visibilty"),
  humidityStatus = document.querySelector(".humidity-status"),
  airQuality = document.querySelector(".air-quality"),
  airQualityStatus = document.querySelector(".air-quality-status"),
  visibilityStatus = document.querySelector(".visibilty-status"),
  searchForm = document.querySelector("#search"),
  search = document.querySelector("#query"),
  celciusBtn = document.querySelector(".celcius"),
  fahrenheitBtn = document.querySelector(".fahrenheit"),
  tempUnit = document.querySelectorAll(".temp-unit"),
  hourlyBtn = document.querySelector(".hourly"),
  weekBtn = document.querySelector(".week"),
  weatherCards = document.querySelector("#weather-cards");

let currentCity = "";
let currentUnit = "c";
let hourlyorWeek = "week";

// function to get date and time
function getDateTime() {
  let now = new Date(),
    hour = now.getHours(),
    minute = now.getMinutes();

  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  // 12 hours format
  hour = hour % 12;
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minute < 10) {
    minute = "0" + minute;
  }
  let dayString = days[now.getDay()];
  return `${dayString}, ${hour}:${minute}`;
}

//Updating date and time
date.innerText = getDateTime();
setInterval(() => {
  date.innerText = getDateTime();
}, 1000);

// function to get public ip address
function getPublicIp() {
  fetch("https://geolocation-db.com/json/", {
    method: "GET",
    headers: {},
  })
    .then((response) => response.json())
    .then((data) => {
      currentCity = data.city;
      getWeatherData(data.city, currentUnit, hourlyorWeek);
    })
    .catch((err) => {
      console.error(err);
    });
}

getPublicIp();

function getWeatherData(city, unit, hourlyorWeek) {
  fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=EJ6UBL2JEQGYB3AA4ENASN62J&contentType=json`,
    {
      method: "GET",
      headers: {},
    }
  )
    .then((response) => response.json())
    .then((data) => {
      let today = data.currentConditions;
      if (unit === "c") {
        temp.innerText = today.temp;
      } else {
        temp.innerText = celciusToFahrenheit(today.temp);
      }
      currentLocation.innerText = data.resolvedAddress;
      condition.innerText = today.conditions;
      rain.innerText = "Perc - " + today.precip + "%";
      uvIndex.innerText = today.uvindex;
      windSpeed.innerText = today.windspeed;
      measureUvIndex(today.uvindex);
      mainIcon.src = getIcon(today.icon);
      changeBackground(today.icon);
      humidity.innerText = today.humidity + "%";
      updateHumidityStatus(today.humidity);
      visibilty.innerText = today.visibility;
      updateVisibiltyStatus(today.visibility);
      airQuality.innerText = today.winddir;
      updateAirQualityStatus(today.winddir);
      if (hourlyorWeek === "hourly") {
        updateForecast(data.days[0].hours, unit, "day");
      } else {
        updateForecast(data.days, unit, "week");
      }
      sunRise.innerText = covertTimeTo12HourFormat(today.sunrise);
      sunSet.innerText = covertTimeTo12HourFormat(today.sunset);
    })
    .catch((err) => {
      alert("City not found in our database");
    });
}

//function to update Forecast
function updateForecast(data, unit, type) {
  weatherCards.innerHTML = "";
  let day = 0;
  let numCards = 0;
  if (type === "day") {
    numCards = 24;
  } else {
    numCards = 7;
  }
  for (let i = 0; i < numCards; i++) {
    let card = document.createElement("div");
    card.classList.add("card");
    let dayName = getHour(data[day].datetime);
    if (type === "week") {
      dayName = getDayName(data[day].datetime);
    }
    let dayTemp = data[day].temp;
    if (unit === "f") {
      dayTemp = celciusToFahrenheit(data[day].temp);
    }
    let iconCondition = data[day].icon;
    let iconSrc = getIcon(iconCondition, true); // assuming it's always daytime for forecast
    let tempUnit = "°C";
    if (unit === "f") {
      tempUnit = "°F";
    }
    card.innerHTML = `
                <h2 class="day-name">${dayName}</h2>
            <div class="card-icon">
              <img src="${iconSrc}" class="day-icon" alt="" />
            </div>
            <div class="day-temp">
              <h2 class="temp">${dayTemp}</h2>
              <span class="temp-unit">${tempUnit}</span>
            </div>
  `;
    weatherCards.appendChild(card);
    day++;
  }
}

// function to change weather icons
function getIcon(condition, isDaytime) {
  // Assuming it's day if isDaytime is true, otherwise night
    if (condition === "partly-cloudy-day") {
      return "icons/sun/27.png";
    } else if (condition === "partly-cloudy-night") {
      return "icons/moon/15.png";
    } else if (condition === "rain") {
        return "icons/rain/39.png";
    } else if (condition === "clear-day") {
      return "icons/sun/26.png";
    } else if (condition === "clear-night") {
      return "icons/moon/10.png";
    } else  {
      return "icons/sun/26.png";}
    }
  

// function to change background depending on weather conditions
function changeBackground(condition) {
  const body = document.querySelector("body");
  let bg = "";
  if (condition === "partly-cloudy-day") {
    bg = "https://i.ibb.co/qNv7NxZ/pc.webp";
  } else if (condition === "partly-cloudy-night") {
    bg = "https://i.ibb.co/RDfPqXz/pcn.jpg";
  } else if (condition === "rain") {
    bg = "https://i.ibb.co/h2p6Yhd/rain.webp";
  } else if (condition === "clear-day") {
    bg = "https://i.ibb.co/WGry01m/cd.jpg";
  } else if (condition === "clear-night") {
    bg = "https://i.ibb.co/kqtZ1Gx/cn.jpg";
  } else {
    bg = "https://i.ibb.co/qNv7NxZ/pc.webp";
  }
  body.style.backgroundImage = `linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ),url(${bg})`;
}

//get hours from hh:mm:ss
function getHour(time) {
  let hour = time.split(":")[0];
  let min = time.split(":")[1];
  if (hour > 12) {
    hour = hour - 12;
    return `${hour}:${min} PM`;
  } else {
    return `${hour}:${min} AM`;
  }
}

// convert time to 12 hour format
function covertTimeTo12HourFormat(time) {
  let hour = time.split(":")[0];
  let minute = time.split(":")[1];
  let ampm = hour >= 12 ? "pm" : "am";
  hour = hour % 12;
  hour = hour ? hour : 12; // the hour '0' should be '12'
  hour = hour < 10 ? "0" + hour : hour;
  minute = minute < 10 ? "0" + minute : minute;
  let strTime = hour + ":" + minute + " " + ampm;
  return strTime;
}


// function to get day name from date
function getDayName(date) {
  let day = new Date(date);
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day.getDay()];
}

// function to get uv index status
function measureUvIndex(uvIndex) {
  if (uvIndex <= 2) {
    uvText.innerText = "Low";
  } else if (uvIndex <= 5) {
    uvText.innerText = "Moderate";
  } else if (uvIndex <= 7) {
    uvText.innerText = "High";
  } else if (uvIndex <= 10) {
    uvText.innerText = "Very High";
  } else {
    uvText.innerText = "Extreme";
  }
}

// function to get humidity status
function updateHumidityStatus(humidity) {
  if (humidity <= 30) {
    humidityStatus.innerText = "Low";
  } else if (humidity <= 60) {
    humidityStatus.innerText = "Moderate";
  } else {
    humidityStatus.innerText = "High";
  }
}

// function to get visibility status
function updateVisibiltyStatus(visibility) {
  if (visibility <= 0.03) {
    visibilityStatus.innerText = "Dense Fog";
  } else if (visibility <= 0.16) {
    visibilityStatus.innerText = "Moderate Fog";
  } else if (visibility <= 0.35) {
    visibilityStatus.innerText = "Light Fog";
  } else if (visibility <= 1.13) {
    visibilityStatus.innerText = "Very Light Fog";
  } else if (visibility <= 2.16) {
    visibilityStatus.innerText = "Light Mist";
  } else if (visibility <= 5.4) {
    visibilityStatus.innerText = "Very Light Mist";
  } else if (visibility <= 10.8) {
    visibilityStatus.innerText = "Clear Air";
  } else {
    visibilityStatus.innerText = "Very Clear Air";
  }
}

// function to get air quality status
function updateAirQualityStatus(airquality) {
  if (airquality <= 50) {
    airQualityStatus.innerText = "Good";
  } else if (airquality <= 100) {
    airQualityStatus.innerText = "Moderate";
  } else if (airquality <= 150) {
    airQualityStatus.innerText = "Unhealthy for Sensitive Groups";
  } else if (airquality <= 200) {
    airQualityStatus.innerText = "Unhealthy";
  } else if (airquality <= 250) {
    airQualityStatus.innerText = "Very Unhealthy";
  } else {
    airQualityStatus.innerText = "Hazardous";
  }
}

// function to handle search form
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let location = search.value;
  if (location) {
    currentCity = location;
    getWeatherData(location, currentUnit, hourlyorWeek);
  }
});

// function to conver celcius to fahrenheit
function celciusToFahrenheit(temp) {
  return ((temp * 9) / 5 + 32).toFixed(1);
}


var currentFocus;
search.addEventListener("input", function (e) {
  removeSuggestions();
  var a,
    b,
    i,
    val = this.value;
  if (!val) {
    return false;
  }
  currentFocus = -1;

  a = document.createElement("ul");
  a.setAttribute("id", "suggestions");

  this.parentNode.appendChild(a);

  for (i = 0; i < cities.length; i++) {
    /*check if the item starts with the same letters as the text field value:*/
    if (
      cities[i].name.substr(0, val.length).toUpperCase() == val.toUpperCase()
    ) {
      /*create a li element for each matching element:*/
      b = document.createElement("li");
      /*make the matching letters bold:*/
      b.innerHTML =
        "<strong>" + cities[i].name.substr(0, val.length) + "</strong>";
      b.innerHTML += cities[i].name.substr(val.length);
      /*insert a input field that will hold the current array item's value:*/
      b.innerHTML += "<input type='hidden' value='" + cities[i].name + "'>";
      /*execute a function when someone clicks on the item value (DIV element):*/
      b.addEventListener("click", function (e) {
        /*insert the value for the autocomplete text field:*/
        search.value = this.getElementsByTagName("input")[0].value;
        removeSuggestions();
      });

      a.appendChild(b);
    }
  }
});
/*execute a function presses a key on the keyboard:*/
search.addEventListener("keydown", function (e) {
  var x = document.getElementById("suggestions");
  if (x) x = x.getElementsByTagName("li");
  if (e.keyCode == 40) {
    /*If the arrow DOWN key
      is pressed,
      increase the currentFocus variable:*/
    currentFocus++;
    /*and and make the current item more visible:*/
    addActive(x);
  } else if (e.keyCode == 38) {
    /*If the arrow UP key
      is pressed,
      decrease the currentFocus variable:*/
    currentFocus--;
    /*and and make the current item more visible:*/
    addActive(x);
  }
  if (e.keyCode == 13) {
    /*If the ENTER key is pressed, prevent the form from being submitted,*/
    e.preventDefault();
    if (currentFocus > -1) {
      /*and simulate a click on the "active" item:*/
      if (x) x[currentFocus].click();
    }
  }
});
function addActive(x) {
  /*a function to classify an item as "active":*/
  if (!x) return false;
  /*start by removing the "active" class on all items:*/
  removeActive(x);
  if (currentFocus >= x.length) currentFocus = 0;
  if (currentFocus < 0) currentFocus = x.length - 1;
  /*add class "autocomplete-active":*/
  x[currentFocus].classList.add("active");
}
function removeActive(x) {
  /*a function to remove the "active" class from all autocomplete items:*/
  for (var i = 0; i < x.length; i++) {
    x[i].classList.remove("active");
  }
}

function removeSuggestions() {
  var x = document.getElementById("suggestions");
  if (x) x.parentNode.removeChild(x);
}

fahrenheitBtn.addEventListener("click", () => {
  changeUnit("f");
});
celciusBtn.addEventListener("click", () => {
  changeUnit("c");
});

// function to change unit
function changeUnit(unit) {
  if (currentUnit !== unit) {
    currentUnit = unit;
    tempUnit.forEach((elem) => {
      elem.innerText = `°${unit.toUpperCase()}`;
    });
    if (unit === "c") {
      celciusBtn.classList.add("active");
      fahrenheitBtn.classList.remove("active");
    } else {
      celciusBtn.classList.remove("active");
      fahrenheitBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}

hourlyBtn.addEventListener("click", () => {
  changeTimeSpan("hourly");
});
weekBtn.addEventListener("click", () => {
  changeTimeSpan("week");
});

// function to change hourly to weekly or vice versa
function changeTimeSpan(unit) {
  if (hourlyorWeek !== unit) {
    hourlyorWeek = unit;
    if (unit === "hourly") {
      hourlyBtn.classList.add("active");
      weekBtn.classList.remove("active");
    } else {
      hourlyBtn.classList.remove("active");
      weekBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}


// Cities add your own to get in search

cities = [
  {
    "country": "IN",
    "name": "Mumbai",
    "lat": "19.0760",
    "lng": "72.8777"
  },
  {
    "country": "IN",
    "name": "Delhi",
    "lat": "28.7041",
    "lng": "77.1025"
  },
  {
    "country": "IN",
    "name": "Bangalore",
    "lat": "12.9716",
    "lng": "77.5946"
  },
  {
    "country": "IN",
    "name": "Kolkata",
    "lat": "22.5726",
    "lng": "88.3639"
  },
  {
    "country": "IN",
    "name": "Chennai",
    "lat": "13.0827",
    "lng": "80.2707"
  },
  {
    "country": "IN",
    "name": "Hyderabad",
    "lat": "17.3850",
    "lng": "78.4867"
  },
  {
    "country": "IN",
    "name": "Pune",
    "lat": "18.5204",
    "lng": "73.8567"
  },
  {
    "country": "IN",
    "name": "Ahmedabad",
    "lat": "23.0225",
    "lng": "72.5714"
  },
  {
    "country": "IN",
    "name": "Surat",
    "lat": "21.1702",
    "lng": "72.8311"
  },
  {
    "country": "IN",
    "name": "Jaipur",
    "lat": "26.9124",
    "lng": "75.7873"
  },
  {
    "country": "IN",
    "name": "Lucknow",
    "lat": "26.8467",
    "lng": "80.9462"
  },
  {
    "country": "IN",
    "name": "Kanpur",
    "lat": "26.4499",
    "lng": "80.3319"
  },
  {
    "country": "IN",
    "name": "Nagpur",
    "lat": "21.1458",
    "lng": "79.0882"
  },
  {
    "country": "IN",
    "name": "Indore",
    "lat": "22.7196",
    "lng": "75.8577"
  },
  {
    "country": "IN",
    "name": "Thane",
    "lat": "19.2183",
    "lng": "72.9781"
  },
  {
    "country": "IN",
    "name": "Bhopal",
    "lat": "23.2599",
    "lng": "77.4126"
  },
  {
    "country": "IN",
    "name": "Visakhapatnam",
    "lat": "17.6868",
    "lng": "83.2185"
  },
  {
    "country": "IN",
    "name": "Pimpri-Chinchwad",
    "lat": "18.6279",
    "lng": "73.8007"
  },
  {
    "country": "IN",
    "name": "Patna",
    "lat": "25.5941",
    "lng": "85.1376"
  },
  {
    "country": "IN",
    "name": "Vadodara",
    "lat": "22.3072",
    "lng": "73.1812"
  },
  {
    "country": "IN",
    "name": "Ghaziabad",
    "lat": "28.6692",
    "lng": "77.4538"
  },
  {
    "country": "IN",
    "name": "Ludhiana",
    "lat": "30.9010",
    "lng": "75.8573"
  },
  {
    "country": "IN",
    "name": "Agra",
    "lat": "27.1767",
    "lng": "78.0081"
  },
  {
    "country": "IN",
    "name": "Nashik",
    "lat": "20.0059",
    "lng": "73.7798"
  },
  {
    "country": "IN",
    "name": "Faridabad",
    "lat": "28.4089",
    "lng": "77.3178"
  },
  {
    "country": "IN",
    "name": "Meerut",
    "lat": "28.9845",
    "lng": "77.7064"
  },
  {
    "country": "IN",
    "name": "Rajkot",
    "lat": "22.3039",
    "lng": "70.8022"
  },
  {
    "country": "IN",
    "name": "Kalyan-Dombivli",
    "lat": "19.2353",
    "lng": "73.1296"
  },
  {
    "country": "IN",
    "name": "Vasai-Virar",
    "lat": "19.3919",
    "lng": "72.8397"
  },
  {
    "country": "IN",
    "name": "Varanasi",
    "lat": "25.3176",
    "lng": "82.9739"
  },
  {
    "country": "IN",
    "name": "Srinagar",
    "lat": "34.0837",
    "lng": "74.7973"
  },
  {
    "country": "IN",
    "name": "Aurangabad",
    "lat": "19.8762",
    "lng": "75.3433"
  },
  {
    "country": "IN",
    "name": "Dhanbad",
    "lat": "23.7957",
    "lng": "86.4304"
  },
  {
    "country": "IN",
    "name": "Amritsar",
    "lat": "31.6340",
    "lng": "74.8723"
  },
  {
    "country": "IN",
    "name": "Navi Mumbai",
    "lat": "19.0330",
    "lng": "73.0297"
  },
  {
    "country": "IN",
    "name": "Allahabad",
    "lat": "25.4358",
    "lng": "81.8463"
  },
  {
    "country": "IN",
    "name": "Ranchi",
    "lat": "23.3441",
    "lng": "85.3096"
  },
  {
    "country": "IN",
    "name": "Haora",
    "lat": "22.5769",
    "lng": "88.3186"
  },
  {
    "country": "IN",
    "name": "Gurgaon",
    "lat": "28.4595",
    "lng": "77.0266"
  },
  {
    "country": "IN",
    "name": "Jabalpur",
    "lat": "23.1815",
    "lng": "79.9864"
  },
  {
    "country": "IN",
    "name": "Coimbatore",
    "lat": "11.0168",
    "lng": "76.9558"
  },
  {
    "country": "IN",
    "name": "Madurai",
    "lat": "9.9252",
    "lng": "78.1198"
  },
  {
    "country": "IN",
    "name": "Gwalior",
    "lat": "26.2183",
    "lng": "78.1828"
  },
  {
    "country": "IN",
    "name": "Vijayawada",
    "lat": "16.5062",
    "lng": "80.6480"
  },
  {
    "country": "IN",
    "name": "Jodhpur",
    "lat": "26.2389",
    "lng": "73.0243"
  },
  {
    "country": "IN",
    "name": "Raipur",
    "lat": "21.2514",
    "lng": "81.6296"
  },
  {
    "country": "IN",
    "name": "Kota",
    "lat": "25.2138",
    "lng": "75.8648"
  },
  {
    "country": "IN",
    "name": "Guwahati",
    "lat": "26.1445",
    "lng": "91.7362"
  },
  {
    "country": "IN",
    "name": "Chandigarh",
    "lat": "30.7333",
    "lng": "76.7794"
  },
  {
    "country": "IN",
    "name": "Solapur",
    "lat": "17.6599",
    "lng": "75.9064"
  },
  {
    "country": "IN",
    "name": "Hubli-Dharwad",
    "lat": "15.3647",
    "lng": "75.1239"
  },
  {
    "country": "IN",
    "name": "Bareilly",
    "lat": "28.3670",
    "lng": "79.4304"
  },
  {
    "country": "IN",
    "name": "Moradabad",
    "lat": "28.8389",
    "lng": "78.7768"
  },
  {
    "country": "IN",
    "name": "Mysore",
    "lat": "12.2958",
    "lng": "76.6394"
  },
  {
    "country": "IN",
    "name": "Gurgaon",
    "lat": "28.4595",
    "lng": "77.0266"
  },
  {
    "country": "IN",
    "name": "Aligarh",
    "lat": "27.8974",
    "lng": "78.0880"
  },
  {
    "country": "IN",
    "name": "Jalandhar",
    "lat": "31.3260",
    "lng": "75.5762"
  },
  {
    "country": "IN",
    "name": "Tiruchirappalli",
    "lat": "10.7905",
    "lng": "78.7047"
  },
  {
    "country": "IN",
    "name": "Bhubaneswar",
    "lat": "20.2961",
    "lng": "85.8245"
  },
  {
    "country": "IN",
    "name": "Salem",
    "lat": "11.6643",
    "lng": "78.1460"
  },
  {
    "country": "IN",
    "name": "Warangal",
    "lat": "17.9784",
    "lng": "79.6000"
  },
  {
    "country": "IN",
    "name": "Guntur",
    "lat": "16.3067",
    "lng": "80.4365"
  },
  {
    "country": "IN",
    "name": "Bhiwandi",
    "lat": "19.2813",
    "lng": "73.0485"
  },
  {
    "country": "IN",
    "name": "Saharanpur",
    "lat": "29.9640",
    "lng": "77.5467"
  },
  {
    "country": "IN",
    "name": "Gorakhpur",
    "lat": "26.7606",
    "lng": "83.3732"
  },
  {
    "country": "IN",
    "name": "Bikaner",
    "lat": "28.0229",
    "lng": "73.3119"
  },
  {
    "country": "IN",
    "name": "Amravati",
    "lat": "20.9374",
    "lng": "77.7796"
  },
  {
    "country": "IN",
    "name": "Noida",
    "lat": "28.5355",
    "lng": "77.3910"
  },
  {
    "country": "IN",
    "name": "Jamshedpur",
    "lat": "22.8046",
    "lng": "86.2029"
  },
  {
    "country": "IN",
    "name": "Bhilai Nagar",
    "lat": "21.1938",
    "lng": "81.3509"
  },
  {
    "country": "IN",
    "name": "Cuttack",
    "lat": "20.4625",
    "lng": "85.8828"
  },
  {
    "country": "IN",
    "name": "Firozabad",
    "lat": "27.1509",
    "lng": "78.3955"
  },
  {
    "country": "IN",
    "name": "Kochi",
    "lat": "9.9312",
    "lng": "76.2673"
  },
  {
    "country": "IN",
    "name": "Nellore",
    "lat": "14.4426",
    "lng": "79.9865"
  },
  {
    "country": "IN",
    "name": "Bhavnagar",
    "lat": "21.7645",
    "lng": "72.1519"
  },
  {
    "country": "IN",
    "name": "Dehradun",
    "lat": "30.3165",
    "lng": "78.0322"
  },
  {
    "country": "IN",
    "name": "Durgapur",
    "lat": "23.5204",
    "lng": "87.3119"
  },
  {
    "country": "IN",
    "name": "Asansol",
    "lat": "23.6739",
    "lng": "86.9524"
  },
  {
    "country": "IN",
    "name": "Rourkela",
    "lat": "22.2587",
    "lng": "84.8568"
  },
  {
    "country": "IN",
    "name": "Nanded",
    "lat": "19.1383",
    "lng": "77.3210"
  },
  {
    "country": "IN",
    "name": "Kolhapur",
    "lat": "16.7050",
    "lng": "74.2433"
  },
  {
    "country": "IN",
    "name": "Ajmer",
    "lat": "26.4499",
    "lng": "74.6399"
  },
  {
    "country": "IN",
    "name": "Akola",
    "lat": "20.7059",
    "lng": "77.0219"
  },
  {
    "country": "IN",
    "name": "Gulbarga",
    "lat": "17.3297",
    "lng": "76.8343"
  },
  {
    "country": "IN",
    "name": "Jamnagar",
    "lat": "22.4707",
    "lng": "70.0577"
  },
  {
    "country": "IN",
    "name": "Ujjain",
    "lat": "23.1765",
    "lng": "75.7885"
  },
  {
    "country": "IN",
    "name": "Loni",
    "lat": "28.7514",
    "lng": "77.2886"
  },
  {
    "country": "IN",
    "name": "Siliguri",
    "lat": "26.7271",
    "lng": "88.3953"
  },
  {
    "country": "IN",
    "name": "Jhansi",
    "lat": "25.4484",
    "lng": "78.5685"
  },
  {
    "country": "IN",
    "name": "Ulhasnagar",
    "lat": "19.2183",
    "lng": "73.1632"
  },
  {
    "country": "IN",
    "name": "Nellore",
    "lat": "14.4426",
    "lng": "79.9865"
  },
  {
    "country": "IN",
    "name": "Sangli-Miraj & Kupwad",
    "lat": "16.8497",
    "lng": "74.6028"
  },
  {
    "country": "IN",
    "name": "Belgaum",
    "lat": "15.8497",
    "lng": "74.4977"
  },
  {
    "country": "IN",
    "name": "Mangalore",
    "lat": "12.9141",
    "lng": "74.8560"
  },
  {
    "country": "IN",
    "name": "Ambattur",
    "lat": "13.1129",
    "lng": "80.1593"
  },
  {
    "country": "IN",
    "name": "Tirunelveli",
    "lat": "8.7139",
    "lng": "77.7567"
  },
  {
    "country": "IN",
    "name": "Malegaon",
    "lat": "20.5537",
    "lng": "74.5288"
  },
  {
    "country": "IN",
    "name": "Gaya",
    "lat": "24.7955",
    "lng": "85.0073"
  },
  {
    "country": "IN",
    "name": "Jalgaon",
    "lat": "21.0100",
    "lng": "75.5681"
  },
  {
    "country": "IN",
    "name": "Udaipur",
    "lat": "24.5854",
    "lng": "73.7125"
  },
  {
    "country": "IN",
    "name": "Maheshtala",
    "lat": "22.5099",
    "lng": "88.3074"
  },
  {
    "country": "IN",
    "name": "Tirupur",
    "lat": "11.1085",
    "lng": "77.3411"
  },
  {
    "country": "IN",
    "name": "Davanagere",
    "lat": "14.4644",
    "lng": "75.9218"
  },
  {
    "country": "IN",
    "name": "Kozhikode",
    "lat": "11.2588",
    "lng": "75.7804"
  },
  {
    "country": "IN",
    "name": "Akbarpur",
    "lat": "26.4235",
    "lng": "82.7782"
  },
  {
    "country": "IN",
    "name": "Kurnool",
    "lat": "15.8281",
    "lng": "78.0373"
  },
  {
    "country": "IN",
    "name": "Rajpur Sonarpur",
    "lat": "22.4127",
    "lng": "88.3993"
  },
  {
    "country": "IN",
    "name": "Bokaro",
    "lat": "23.6693",
    "lng": "86.1511"
  },
  {
    "country": "IN",
    "name": "South Dumdum",
    "lat": "22.6156",
    "lng": "88.4013"
  },
  {
    "country": "IN",
    "name": "Bellary",
    "lat": "15.1394",
    "lng": "76.9214"
  },
  {
    "country": "IN",
    "name": "Patiala",
    "lat": "30.3398",
    "lng": "76.3869"
  },
  {
    "country": "IN",
    "name": "Gopalpur",
    "lat": "19.2638",
    "lng": "84.8256"
  },
  {
    "country": "IN",
    "name": "Agartala",
    "lat": "23.8315",
    "lng": "91.2868"
  },
  {
    "country": "IN",
    "name": "Bhagalpur",
    "lat": "25.2445",
    "lng": "86.9718"
  },
  {
    "country": "IN",
    "name": "Muzaffarnagar",
    "lat": "29.4722",
    "lng": "77.7081"
  },
  {
    "country": "IN",
    "name": "Bhatpara",
    "lat": "22.8675",
    "lng": "88.4016"
  },
  {
    "country": "IN",
    "name": "Panihati",
    "lat": "22.6900",
    "lng": "88.3744"
  },
  {
    "country": "IN",
    "name": "Latur",
    "lat": "18.4088",
    "lng": "76.5604"
  },
  {
    "country": "IN",
    "name": "Dhule",
    "lat": "20.9015",
    "lng": "74.7748"
  },
  {
    "country": "IN",
    "name": "Rohtak",
    "lat": "28.8955",
    "lng": "76.6066"
  },
  {
    "country": "IN",
    "name": "Korba",
    "lat": "22.3587",
    "lng": "82.7195"
  },
  {
    "country": "IN",
    "name": "Bhilwara",
    "lat": "25.3473",
    "lng": "74.6408"
  },
  {
    "country": "IN",
    "name": "Brahmapur",
    "lat": "19.3142",
    "lng": "84.7941"
  },
  {
    "country": "IN",
    "name": "Muzaffarpur",
    "lat": "26.1209",
    "lng": "85.3647"
  },
  {
    "country": "IN",
    "name": "Ahmednagar",
    "lat": "19.0952",
    "lng": "74.7496"
  },
  {
    "country": "IN",
    "name": "Mathura",
    "lat": "27.1767",
    "lng": "77.7079"
  },
  {
    "country": "IN",
    "name": "Kollam",
    "lat": "8.8932",
    "lng": "76.6141"
  },
  {
    "country": "IN",
    "name": "Avadi",
    "lat": "13.1147",
    "lng": "80.1030"
  },
  {
    "country": "IN",
    "name": "Kadapa",
    "lat": "14.4674",
    "lng": "78.8241"
  },
  {
    "country": "IN",
    "name": "Anantapur",
    "lat": "14.6546",
    "lng": "77.5560"
  },
  {
    "country": "IN",
    "name": "Kamarhati",
    "lat": "22.6714",
    "lng": "88.3740"
  },
  {
    "country": "IN",
    "name": "Bilaspur",
    "lat": "22.0797",
    "lng": "82.1391"
  },
  {
    "country": "IN",
    "name": "Sambalpur",
    "lat": "21.4707",
    "lng": "83.9700"
  },
  {
    "country": "IN",
    "name": "Shahjahanpur",
    "lat": "27.8815",
    "lng": "79.9110"
  },
  {
    "country": "IN",
    "name": "Satara",
    "lat": "17.6805",
    "lng": "73.9904"
  },
  {
    "country": "IN",
    "name": "Bidar",
    "lat": "17.9226",
    "lng": "77.5170"
  },
  {
    "country": "IN",
    "name": "Rampur",
    "lat": "28.8076",
    "lng": "79.0271"
  },
  {
    "country": "IN",
    "name": "Shivamogga",
    "lat": "13.9299",
    "lng": "75.5681"
  },
  {
    "country": "IN",
    "name": "Chandrapur",
    "lat": "19.9595",
    "lng": "79.2961"
  },
  {
    "country": "IN",
    "name": "Junagadh",
    "lat": "21.5222",
    "lng": "70.4579"
  },
  {
    "country": "IN",
    "name": "Thrissur",
    "lat": "10.5276",
    "lng": "76.2144"
  },
  {
    "country": "IN",
    "name": "Alwar",
    "lat": "27.5530",
    "lng": "76.6346"
  },
  {
    "country": "IN",
    "name": "Bardhaman",
    "lat": "23.2325",
    "lng": "87.8639"
  },
  {
    "country": "IN",
    "name": "Kulti",
    "lat": "23.7313",
    "lng": "86.8436"
  },
  {
    "country": "IN",
    "name": "Kakinada",
    "lat": "16.9890",
    "lng": "82.2475"
  },
  {
    "country": "IN",
    "name": "Nizamabad",
    "lat": "18.6725",
    "lng": "78.0940"
  },
  {
    "country": "IN",
    "name": "Parbhani",
    "lat": "19.2707",
    "lng": "76.7650"
  },
  {
    "country": "IN",
    "name": "Tumkur",
    "lat": "13.3392",
    "lng": "77.1140"
  },
  {
    "country": "IN",
    "name": "Khammam",
    "lat": "17.2473",
    "lng": "80.1514"
  },
  {
    "country": "IN",
    "name": "Ozhukarai",
    "lat": "11.9356",
    "lng": "79.7683"
  },
  {
    "country": "IN",
    "name": "Bihar Sharif",
    "lat": "25.2030",
    "lng": "85.5211"
  },
  {
    "country": "IN",
    "name": "Panipat",
    "lat": "29.3919",
    "lng": "76.9796"
  },
  {
    "country": "IN",
    "name": "Darbhanga",
    "lat": "26.1524",
    "lng": "85.8971"
  },
  {
    "country": "IN",
    "name": "Bally",
    "lat": "22.6500",
    "lng": "88.3400"
  },
  {
    "country": "IN",
    "name": "Aizawl",
    "lat": "23.7271",
    "lng": "92.7176"
  },
  {
    "country": "IN",
    "name": "Dewas",
    "lat": "22.9659",
    "lng": "76.0559"
  },
  {
    "country": "IN",
    "name": "Ichalkaranji",
    "lat": "16.6985",
    "lng": "74.4650"
  },
  {
    "country": "IN",
    "name": "Karnal",
    "lat": "29.6857",
    "lng": "76.9905"
  },
  {
    "country": "IN",
    "name": "Bathinda",
    "lat": "30.2111",
    "lng": "74.9455"
  },
  {
    "country": "IN",
    "name": "Jalna",
    "lat": "19.8356",
    "lng": "75.8824"
  },
  {
    "country": "IN",
    "name": "Eluru",
    "lat": "16.7131",
    "lng": "81.1060"
  },
  {
    "country": "IN",
    "name": "Kirari Suleman Nagar",
    "lat": "28.7326",
    "lng": "77.0319"
  },
  {
    "country": "IN",
    "name": "Barasat",
    "lat": "22.7229",
    "lng": "88.4822"
  },
  {
    "country": "IN",
    "name": "Purnia",
    "lat": "25.7781",
    "lng": "87.4753"
  },
  {
    "country": "IN",
    "name": "Satna",
    "lat": "24.5765",
    "lng": "80.8270"
  },
  {
    "country": "IN",
    "name": "Mau",
    "lat": "25.9478",
    "lng": "83.5600"
  },
  {
    "country": "IN",
    "name": "Sonipat",
    "lat": "28.9951",
    "lng": "77.0119"
  },
  {
    "country": "IN",
    "name": "Farrukhabad",
    "lat": "27.3928",
    "lng": "79.5812"
  },
  {
    "country": "IN",
    "name": "Sagar",
    "lat": "23.8398",
    "lng": "78.7378"
  },
  {
    "country": "IN",
    "name": "Rourkela",
    "lat": "22.2587",
    "lng": "84.8568"
  },
  {
    "country": "IN",
    "name": "Durg",
    "lat": "21.1905",
    "lng": "81.2849"
  },
  {
    "country": "IN",
    "name": "Imphal",
    "lat": "24.8170",
    "lng": "93.9368"
  },
  {
    "country": "IN",
    "name": "Ratlam",
    "lat": "23.3315",
    "lng": "75.0376"
  },
  {
    "country": "IN",
    "name": "Hapur",
    "lat": "28.7304",
    "lng": "77.7800"
  },
  {
    "country": "IN",
    "name": "Arrah",
    "lat": "25.5620",
    "lng": "84.6564"
  },
  {
    "country": "IN",
    "name": "Karimnagar",
    "lat": "18.4392",
    "lng": "79.1288"
  },
  {
    "country": "IN",
    "name": "Anantapur",
    "lat": "14.6546",
    "lng": "77.5560"
  },
  {
    "country": "IN",
    "name": "Etawah",
    "lat": "26.7765",
    "lng": "79.0214"
  },
  {
    "country": "IN",
    "name": "Ambernath",
    "lat": "19.1879",
    "lng": "73.0033"
  },
  {
    "country": "IN",
    "name": "Bharatpur",
    "lat": "27.2153",
    "lng": "77.4920"
  },
  {
    "country": "IN",
    "name": "Begusarai",
    "lat": "25.4186",
    "lng": "86.1334"
  },
  {
    "country": "IN",
    "name": "New Delhi",
    "lat": "28.6139",
    "lng": "77.2090"
  },
  {
    "country": "IN",
    "name": "Gandhidham",
    "lat": "23.0800",
    "lng": "70.1320"
  },
  {
    "country": "IN",
    "name": "Baranagar",
    "lat": "22.6435",
    "lng": "88.3653"
  },
  {
    "country": "IN",
    "name": "Tiruvottiyur",
    "lat": "13.1599",
    "lng": "80.3016"
  },
  {
    "country": "IN",
    "name": "Puducherry",
    "lat": "11.9139",
    "lng": "79.8145"
  },
  {
    "country": "IN",
    "name": "Sikar",
    "lat": "27.6145",
    "lng": "75.1399"
  },
  {
    "country": "IN",
    "name": "Thoothukudi",
    "lat": "8.8050",
    "lng": "78.1450"
  },
  {
    "country": "IN",
    "name": "Rewa",
    "lat": "24.5333",
    "lng": "81.2964"
  },
  {
    "country": "IN",
    "name": "Mirzapur",
    "lat": "25.1337",
    "lng": "82.5644"
  },
  {
    "country": "IN",
    "name": "Raichur",
    "lat": "16.2076",
    "lng": "77.3463"
  },
  {
    "country": "IN",
    "name": "Pali",
    "lat": "25.7714",
    "lng": "73.3239"
  },
  {
    "country": "IN",
    "name": "Ramagundam",
    "lat": "18.7550",
    "lng": "79.4740"
  },
  {
    "country": "IN",
    "name": "Haridwar",
    "lat": "29.9457",
    "lng": "78.1642"
  },
  {
    "country": "IN",
    "name": "Vijayanagaram",
    "lat": "18.1067",
    "lng": "83.3956"
  },
  {
    "country": "IN",
    "name": "Tenali",
    "lat": "16.2385",
    "lng": "80.6401"
  },
  {
    "country": "IN",
    "name": "Nizamabad",
    "lat": "18.6725",
    "lng": "78.0940"
  },
  {
    "country": "IN",
    "name": "Bhimavaram",
    "lat": "16.5449",
    "lng": "81.5212"
  },
  {
    "country": "IN",
    "name": "Munger",
    "lat": "25.3750",
    "lng": "86.4745"
  },
  {
    "country": "IN",
    "name": "Hapur",
    "lat": "28.7304",
    "lng": "77.7800"
  },
  {
    "country": "IN",
    "name": "Shivpuri",
    "lat": "25.4224",
    "lng": "77.6622"
  },
  {
    "country": "IN",
    "name": "Balurghat",
    "lat": "25.2217",
    "lng": "88.7773"
  },
  {
    "country": "IN",
    "name": "Adoni",
    "lat": "15.6300",
    "lng": "77.2800"
  },
  {
    "country": "IN",
    "name": "Jorhat",
    "lat": "26.7577",
    "lng": "94.2094"
  },
  {
    "country": "IN",
    "name": "Tonk",
    "lat": "26.1615",
    "lng": "75.7885"
  },
  {
    "country": "IN",
    "name": "Sirsa",
    "lat": "29.5349",
    "lng": "75.0232"
  },
  {
    "country": "IN",
    "name": "Jaunpur",
    "lat": "25.7511",
    "lng": "82.6928"
  },
  {
    "country": "IN",
    "name": "Madhyamgram",
    "lat": "22.7002",
    "lng": "88.4467"
  },
  {
    "country": "IN",
    "name": "Kendujhar",
    "lat": "21.6321",
    "lng": "85.5750"
  },
  {
    "country": "IN",
    "name": "Bhind",
    "lat": "26.5645",
    "lng": "78.7873"
  },
  {
    "country": "IN",
    "name": "Hosur",
    "lat": "12.7164",
    "lng": "77.8227"
  },
  {
    "country": "IN",
    "name": "Sasaram",
    "lat": "24.9533",
    "lng": "84.0112"
  },
  {
    "country": "IN",
    "name": "Hajipur",
    "lat": "25.6851",
    "lng": "85.2087"
  },
  {
    "country": "IN",
    "name": "Shimla",
    "lat": "31.1048",
    "lng": "77.1734"
  },
  {
    "country": "IN",
    "name": "Baidyabati",
    "lat": "22.8038",
    "lng": "88.3386"
  },
  {
    "country": "IN",
    "name": "Udgir",
    "lat": "18.3905",
    "lng": "77.1134"
  },
  {
    "country": "IN",
    "name": "Shivpuri",
    "lat": "25.4224",
    "lng": "77.6622"
  },
  {
    "country": "IN",
    "name": "Aruppukkottai",
    "lat": "9.5083",
    "lng": "78.0958"
  },
  {
    "country": "IN",
    "name": "Pudukkottai",
    "lat": "10.3906",
    "lng": "78.8209"
  },
  {
    "country": "IN",
    "name": "Machilipatnam",
    "lat": "16.1875",
    "lng": "81.1385"
  },
  {
    "country": "IN",
    "name": "Shimoga",
    "lat": "13.9324",
    "lng": "75.5660"
  },
  {
    "country": "IN",
    "name": "Adilabad",
    "lat": "19.6726",
    "lng": "78.5354"
  },
  {
    "country": "IN",
    "name": "Yavatmal",
    "lat": "20.3888",
    "lng": "78.1208"
  },
  {
    "country": "IN",
    "name": "Barnala",
    "lat": "30.3815",
    "lng": "75.5468"
  },
  {
    "country": "IN",
    "name": "Nagaon",
    "lat": "26.3466",
    "lng": "92.6771"
  },
  {
    "country": "IN",
    "name": "Nagercoil",
    "lat": "8.1781",
    "lng": "77.4323"
  },
  {
    "country": "IN",
    "name": "Morena",
    "lat": "26.4999",
    "lng": "78.0076"
  },
  {
    "country": "IN",
    "name": "Bhiwani",
    "lat": "28.7990",
    "lng": "76.1313"
  },
];
   

