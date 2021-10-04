let lat, long;

if ("geolocation" in navigator) {
	console.log("geolocation available");
	navigator.geolocation.getCurrentPosition((position) => {
		lat = position.coords.latitude;
		long = position.coords.longitude;
		latitude = document.createElement("p");
		latitude.textContent = "latitude: " + lat;
		longitude = document.createElement("p");
		longitude.textContent = "longitude: " + long;
		document.getElementById("loc").append(latitude, longitude);
		//call the rest of the stuff to display now that we have the button

		weatherMap(lat, long);
	});
} else {
	const msg =
		"Geolocation not available.  Please enable location services to use this app.";
	console.log("msg");
	document.getElementById("loc").innerHTML = `<p>${msg}</p>`;
}

function createMap(lat, long) {
	let marker = L.marker([lat, long]);

	mymap = L.map("map").setView([lat, long], 12);
	const attribution =
		'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

	const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
	const tiles = L.tileLayer(tileUrl, { attribution });
	tiles.addTo(mymap);
	marker.addTo(mymap);
}

async function weatherMap(lat, long) {
	//first do the map
	let marker = L.marker([lat, long]);

	mymap = L.map("map").setView([lat, long], 12);
	const attribution =
		'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

	const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
	const tiles = L.tileLayer(tileUrl, { attribution });
	tiles.addTo(mymap);
	marker.addTo(mymap);
	//now the API with the lat, long
	lat = lat.toFixed(1); //get those strings to the right length
	long = long.toFixed(1);
	const api_url = `weather/${lat},${long}`; //send the lat long data to the server
	const response = await fetch(api_url);
	const weather = await response.json(); //get the weather back, parse as json
	console.log(weather);
	const weatherLoc = weather.weather.name;
	const temp = weather.weather.main.temp;
	const desc = weather.weather.weather[0].description;
	const humid = weather.weather.main.humidity;
	const iconCode = weather.weather.weather[0].icon;
	const weatherDiv = document.getElementById("weatherText");
	const weatherP = document.createElement("p");
	weatherP.innerHTML = `It's ${temp}&deg; F in ${weatherLoc} with ${desc}.  <br /> The humidity is ${humid} percent.`;
	weatherDiv.append(weatherP);
	//console.log(weather.air_quality.results[0].measurements[0]);
	const aq_p = document.createElement("p");
	let aq_reading, aq_units, aq_date, aq_msg;
	if (weather.air_quality.results.length == 0) {
		aq_msg = "no air quality data available";
		console.log(aq_msg);
	} else {
		const aq = weather.air_quality.results[0].measurements[0];
		aq_reading = aq.value;
		aq_units = aq.unit;
		aq_date = aq.lastUpdated;
		aq_msg = `The concentration of particulate matter (pm2.5) is ${aq_reading} ${aq_units}, last updated: ${aq_date}`;
	}
	aq_p.textContent = aq_msg; //put whatever msg we get

	weatherDiv.append(aq_p);

	const iconDiv = document.getElementById("weatherImg");
	const icon = document.createElement("img");
	iconSrc = `http://openweathermap.org/img/wn/${iconCode}@4x.png`;
	icon.src = iconSrc;
	iconDiv.append(icon);

	//now, create a button and do a check-in
	var btn = document.createElement("button");
	btn.textContent = "Check-in";
	weatherDiv.append(btn);
	btn.addEventListener("click", async () => {
		const data = {
			loc: { lat, long },
			weather: {
				weatherLoc,
				temp,
				desc,
				iconSrc,
			},
			air: aq_msg,
		};
		const options = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		};
		const response = await fetch("/api", options);
		const json = await response.json();
		console.log(json);
	});
}
