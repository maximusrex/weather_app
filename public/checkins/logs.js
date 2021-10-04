async function getDatabase() {
	const response = await fetch("/api"); //can re-use the api route with a get
	const data = await response.json();
	//create map
	mymap = L.map("map").setView([36.0, -78.9], 1.6);
	const attribution =
		'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

	const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
	const tiles = L.tileLayer(tileUrl, { attribution });
	tiles.addTo(mymap);
	//make a marker for each data
	for (item of data) {
		let marker = L.marker([item.loc.lat, item.loc.long]);
		marker.addTo(mymap);
		//add some text to the checkin that has weather and AQ
		const dateString = Date(item.timestamp).toLocaleString();
		const txt = `Check in from ${item.loc.lat}&deg;,${item.loc.long}&deg;, ${item.weather.weatherLoc} on ${dateString}. <br />  The temp was ${item.weather.temp} with ${item.weather.desc}. <br /> ${item.air}`;
		marker.bindPopup(txt);
	}
}
getDatabase();
