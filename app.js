import { config } from './config.js';
import { prompts } from './prompts.js';

document.addEventListener('DOMContentLoaded', function () {
    let map;
    let markers = [];
    let activeToast = null;


    const initMap = () => {
        const defaultLocation = { lat: 38, lng: -95 };
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 4.5,
            center: defaultLocation,
            fullscreenControl: false,
        });
    };

    const extractLocation = async (locationDescription, id) => {
    if (!locationDescription) {
        locationDescription = document.getElementById('location-description').value;
    }
    const openaiApiKey = config.openai_api_key;
    const googleApiKey = config.google_api_key;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',  // the model can be changed to other versions
                messages: [
                    prompts.locationExtraction[0],
                    { "role": "system", "content": "Extract location" },
                    { "role": "user", "content": locationDescription }
                ]
            })
        });

        const data = await response.json();
        const extractedLocation = data.choices[0].message.content.trim();
        const geoResponse = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(extractedLocation)}&key=${googleApiKey}`);
        const geoData = await geoResponse.json();

        if (geoData.results && geoData.results.length > 0) {
            const coords = geoData.results[0].geometry.location;
            addMapMarker(coords, locationDescription, id);
        } else {
            throw new Error(`ID ${id}: Could not find latitude and longitude for the location.`);
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

    const addMapMarker = (location, description, id) => {
        const marker = new google.maps.Marker({
            position: location,
            map: map,
            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            title: `${id}`
        });

        const infoWindowContent = `
            <div>
                <h3>${id}</h3>
                <p>${description}</p>
            </div>
        `;

        const infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
        });

        marker.addListener('click', function() {
            infoWindow.open(map, marker);
        });

        marker.infoWindow = infoWindow;
        markers.push(marker);
    };

    function showToast(message) {
        clearToast();
        const toastContainer = document.getElementById('toast-container');
        const toastMessage = document.createElement('div');
        toastMessage.classList.add('toast-message');
        toastMessage.innerText = message;

        toastContainer.appendChild(toastMessage);
        toastMessage.style.opacity = 1;
        activeToast = toastMessage;
    }

    function clearToast() {
        if (activeToast) {
            activeToast.remove();
            activeToast = null;
        }
    }

    function exportMarkersToKML() {
        let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document>\n`;

        markers.forEach(marker => {
            const position = marker.getPosition();
            const title = marker.title || 'No Title';
            const description = marker.infoWindow ? marker.infoWindow.getContent() : 'No Description';

            kmlContent += `
                <Placemark>
                    <name>${escapeXml(title)}</name>
                    <description>${escapeXml(description)}</description>
                    <Point>
                        <coordinates>${position.lng()},${position.lat()},0</coordinates>
                    </Point>
                </Placemark>
            `;
        });

        kmlContent += `</Document>\n</kml>`;

        return kmlContent;
    }

    function escapeXml(unsafe) {
        return unsafe ? unsafe.replace(/[<>&'"]/g, function (c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
        }) : '';
    }

    function downloadKMLFile() {
        const kmlData = exportMarkersToKML();
        const blob = new Blob([kmlData], { type: 'application/vnd.google-earth.kml+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'markers.kml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function parseCSVFile(file) {
        Papa.parse(file, {
            complete: function(results) {
                processCSVData(results.data);
            },
            header: true
        });
    }

     async function processCSVData(data) {
        const startTime = Date.now();
        const batchSize = 250;
        let failedIds = [];

        for (let start = 0; start < data.length; start += batchSize) {
            const end = Math.min(start + batchSize, data.length);
            const batchData = data.slice(start, end);

            for (const row of batchData) {
                const locationDescription = row.message;
                const markerId = row.id;
                if (locationDescription && markerId) {
                    try {
                        await extractLocation(locationDescription, markerId);
                    } catch (error) {
                        failedIds.push(markerId);
                    }
                }
            }
        }

        const endTime = Date.now();
        const processingTime = ((endTime - startTime) / 1000).toFixed(2);
        let finalMessage = `Your file has been processed in ${processingTime} seconds.`;
        if (failedIds.length > 0) {
            finalMessage += ` Unable to mark IDs ${failedIds.join(', ')} on the map.`;
        }
        showToast(finalMessage);
    }

    document.getElementById('process-csv-button').addEventListener('click', async () => {
        const fileInput = document.getElementById('csv-file-input');
        const file = fileInput.files[0];
        if (file) {
            Papa.parse(file, {
                complete: async function(results) {
                    await processCSVData(results.data);
                },
                header: true
            });
        } else {
            alert('Please select a CSV file to upload.');
        }
    });

    initMap();
    document.getElementById('export-button').addEventListener('click', downloadKMLFile);
    document.getElementById('export-csv-button').addEventListener('click', downloadCSVFile);
});
