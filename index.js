//Working with Data And APIs, module 3
//API request to external data source from the server

const express = require("express");
const app = express();
const Datastore = require("nedb");
const fetch = require("node-fetch");
require("dotenv").config();

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening at ${port}`));

app.use(express.static("public"));
//need to parse any incoming data
app.use(express.json({ limit: "1mb" }));

const database = new Datastore("checkins.db"); //make,load db
database.loadDatabase();

app.post("/api", (req, res) => {
	const data = req.body; //get the data from the body of the request
	const timestamp = Date.now(); //add a timestamp
	data.timestamp = timestamp;
	database.insert(data);
	console.log(data);
	res.json(data);
});

app.get("/api", (request, response) => {
	database.find({}, (err, data) => {
		if (err) {
			response.end();
			return;
		} else {
			response.json(data);
		}
	});
});

app.get("/weather/:latlong", async (req, res) => {
	const latlong = req.params.latlong.split(",");
	const lat = latlong[0];
	const long = latlong[1];
	const api_key = process.env.API_KEY;
	const weather_url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=imperial&appid=${api_key}`;
	const weather_response = await fetch(weather_url); //get weather API Data
	const weather_data = await weather_response.json();

	const aq_url = `https://docs.openaq.org/v2/latest?coordinates=${lat},${long}`;
	const aq_response = await fetch(aq_url); //get aq index data
	const aq_data = await aq_response.json();
	//console.log(aq_data);

	const data = {
		weather: weather_data,
		air_quality: aq_data,
	};
	res.json(data);
});
