const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configuration
const AIRTABLE_PERSONAL_ACCESS_TOKEN = 'patY2dyKsgteJlzcP.37e931829f2d6bec4c5d4d1c8d5c5e064ec72215ed14b8d4704eaa44e34bd327';
const BASE_ID = 'app8IbOvqx9URXwkJ';
const TABLE_NAME = 'Main';
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiaGVyb21hcCIsImEiOiJjbHg3c3BkYWwwcjNhMnFyMG5vYm9xNmxuIn0.wTTuJeSzadS8o4lMIhH_Jw';

// Function to fetch all records from Airtable
async function fetchAirtableRecords() {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
    const headers = {
        Authorization: `Bearer ${AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
    };
    const params = {
        filterByFormula: "AND({Category/Layers} = '100 Free Things To Do', {Address} != '')"
    };

    let records = [];
    let offset = null;

    while (true) {
        if (offset) {
            params.offset = offset;
        }

        const response = await axios.get(url, { headers, params });
        if (response.status !== 200) {
            throw new Error(`Error fetching records from Airtable: ${response.status}, ${response.data}`);
        }

        records = records.concat(response.data.records);
        offset = response.data.offset;

        if (!offset) {
            break;
        }
    }

    return records;
}

// Function to geocode address using MapBox API
async function geocodeAddress(address) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`;
    const params = {
        access_token: MAPBOX_ACCESS_TOKEN,
        limit: 1
    };

    const response = await axios.get(url, { params });
    if (response.data.features.length > 0) {
        const coordinates = response.data.features[0].geometry.coordinates;
        return {
            latitude: coordinates[1],
            longitude: coordinates[0]
        };
    }
    return null;
}

// Function to process records and geocode addresses
async function processRecords(records) {
    const locations = [];

    for (const record of records) {
      const fields = record.fields;
      const address = fields.Address || null; // Set to null if missing

      const email = fields['E-Mail Address'] || null; // Set to null if missing
      const phone = fields['Phone Number'] || null; // Set to null if missing
      const website = fields['Website Links'] || null; // Set to null if missing
      const hoursOfOperation = fields['Hours of Operation'] || null; // Set to null if missing
      const name = fields.Name || null; // Set to null if missing
      const description = fields.Description || null; // Set to null if missing

      if (address) {
          const coords = await geocodeAddress(address);
          if (coords) {
              locations.push({
                  name: name,
                  description: description,
                  website: website,
                  email: email,
                  phone: phone,
                  hours_of_Operation: hoursOfOperation,
                  latitude: coords.latitude,
                  longitude: coords.longitude
              });
          }
      } else {
          console.error("No record found");
      }
  }

    return locations;
}

// Define a POST route to handle the webhook event
app.post('/webhook', async (req, res) => {
    try {
        // Log the incoming webhook payload from Airtable
        console.log('Webhook payload received:', req.body);

        // Fetch records from Airtable
        const records = await fetchAirtableRecords();
        const locations = await processRecords(records);

        // Save the locations data to a JSON file
        fs.writeFileSync('locations.json', JSON.stringify(locations, null, 2));

        // Respond to Airtable to acknowledge the webhook
        res.status(200).send('Webhook received and data processed');
    } catch (error) {
        console.error('Error processing webhook:', error.message);
        res.status(500).send('Error processing webhook');
    }
});

app.get('/locations', (req, res) => {
  fs.readFile('locations.json', 'utf8', (err, data) => {
      if (err) {
          console.error('Error reading locations.json:', err);
          return res.status(500).send('Error retrieving locations data');
      }
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(data);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
