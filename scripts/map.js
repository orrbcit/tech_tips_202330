var map; //global variable

function showMap() {
    //------------------------------------------
    // Defines and initiates basic mapbox data
    //------------------------------------------
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWRhbWNoZW4zIiwiYSI6ImNsMGZyNWRtZzB2angzanBjcHVkNTQ2YncifQ.fTdfEXaQ70WoIFLZ2QaRmQ';
    map = new mapboxgl.Map({
        container: 'map', // Container ID
        style: 'mapbox://styles/mapbox/streets-v11', // Styling URL
        center: [-122.964274, 49.236082], // Starting position
        zoom: 8 // Starting zoom
    });

    // Add user controls to map
    map.addControl(new mapboxgl.NavigationControl());

    //------------------------------------------------
    // Add listener for when the map finishes loading.
    // After loading, we can add map features
    //------------------------------------------------
    map.on('load', () => {

        //---------------------------------
        // Add interactive pins for the hikes
        //---------------------------------
        addHikePinsCircle(map);
        //addHikePinsCustomImage(map);

        //--------------------------------------
        // Add interactive pin for the user's location
        //--------------------------------------
        //addUserPinCustomImage(map);
        addUserPinCircle();

    });
}

function moveUserDot() {
    // Call getGeolocation every 5 seconds
    console.log("one second " + currentLocation);
    //currentLocation[0] += 100;
    //if (currentLocation[0]-userLocation[0]> .01)
    addUserPinCircle(map);
}
//setInterval(moveUserDot, 5000);


function addHikePinsCircle(map) {

    // READING information from "events" collection in Firestore
    db.collection('hikes').get().then(allEvents => {
        const features = []; // Defines an empty array for information to be added to

        allEvents.forEach(doc => {
            // Extract coordinates of the place
            coordinates = [doc.data().lng, doc.data().lat];
            console.log(coordinates);
            // Extract other addition fields that you want etc.
            event_name = doc.data().name; // Event Name
            preview = doc.data().details; // Text Preview
            // img = doc.data().posterurl; // Image
            // url = doc.data().link; // URL

            posts = doc.data().posts //
            var imgstring = "Pets: ";
            console.log("number of pets here: " + posts.length);
            if (posts.length != 0) {
                posts.forEach(function (p) {
                    db.collection("posts").doc(p).get().then(doc => {
                        var pstr = doc.data().image;
                        imgstring += "<img src='" + pstr + "' width=30 height=30/>"
                        console.log(imgstring);
                        localStorage.setItem("imgstr", imgstring);
                    })
                })
            } else {
                localStorage.setItem("imgstr", imgstring + " none");
            }

            imgstring = localStorage.getItem("imgstr");

            // Push information (properties, geometry) into the features array
            features.push({
                'type': 'Feature',
                'properties': {
                    'description': `<strong>${event_name}</strong><p>${preview}</p> 
                    ${imgstring}
                    <br>`
                    // 'description': `<strong>${event_name}</strong><p>${preview}</p> 
                    //         <br> 
                    //         <img src="./images/drink1.jpg" width=50 height=50/>
                    //         title="Opens in a new window">Read more</a>`
                },
                'geometry': {
                    'type': 'Point',
                    'coordinates': coordinates
                }
            });
        });

        // Adds features (in our case, pins) to the map
        // "places" is the name of this array of features
        map.addSource('places', {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': features
            }
        });

        // Creates a layer above the map displaying the pins
        // Add a layer showing the places.
        map.addLayer({
            'id': 'places',
            'type': 'circle', // what the pins/markers/points look like
            'source': 'places',
            'paint': { // customize colour and size
                'circle-color': 'red',
                'circle-radius': 6,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff'
            }
        });

        // When one of the "places" markers are clicked,
        // create a popup that shows information 
        // Everything related to a marker is save in features[] array
        map.on('click', 'places', (e) => {
            // Copy coordinates array.
            const coordinates = e.features[0].geometry.coordinates.slice();
            const description = e.features[0].properties.description;

            // Ensure that if the map is zoomed out such that multiple 
            // copies of the feature are visible, the popup appears over 
            // the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(map);
        });

        // Change the cursor to a pointer when the mouse is over the places layer.
        map.on('mouseenter', 'places', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        // Defaults cursor when not hovering over the places layer
        map.on('mouseleave', 'places', () => {
            map.getCanvas().style.cursor = '';
        });
    });
}

function addHikePinsCustomImage(map) {
    map.loadImage(
        'https://cdn.iconscout.com/icon/free/png-256/pin-locate-marker-location-navigation-16-28668.png',
        (error, image) => {
            if (error) throw error;

            // Add the image to the map style.
            map.addImage('eventpin', image); // Pin Icon

            // READING information from "events" collection in Firestore
            db.collection('hikes').get().then(allEvents => {
                const features = []; // Defines an empty array for information to be added to

                allEvents.forEach(doc => {
                    lat = doc.data().lat;
                    lng = doc.data().lng;
                    console.log(lat, lng);
                    coordinates = [lng, lat];
                    console.log(coordinates);
                    // Coordinates
                    event_name = doc.data().name; // Event Name
                    preview = doc.data().details; // Text Preview
                    // img = doc.data().posterurl; // Image
                    // url = doc.data().link; // URL

                    // Pushes information into the features array
                    features.push({
                        'type': 'Feature',
                        'properties': {
                            'description': `<strong>${event_name}</strong><p>${preview}</p> 
                            <br> <a href="/hike.html?id=${doc.id}" target="_blank" 
                            title="Opens in a new window">Read more</a>`
                        },
                        'geometry': {
                            'type': 'Point',
                            'coordinates': coordinates
                        }
                    });
                });

                // Adds features (in our case, pins) to the map
                // "places" is the name of this array of features
                map.addSource('places', {
                    'type': 'geojson',
                    'data': {
                        'type': 'FeatureCollection',
                        'features': features
                    }
                });

                // Creates a layer above the map displaying the pins
                map.addLayer({
                    'id': 'places',
                    'type': 'symbol',
                    'source': 'places',
                    'layout': {
                        'icon-image': 'eventpin', // Pin Icon
                        'icon-size': 0.1, // Pin Size
                        'icon-allow-overlap': true // Allows icons to overlap
                    }
                });

                // When one of the "places" markers are clicked,
                // create a popup that shows information 
                // Everything related to a marker is save in features[] array
                map.on('click', 'places', (e) => {
                    // Copy coordinates array.
                    const coordinates = e.features[0].geometry.coordinates.slice();
                    const description = e.features[0].properties.description;

                    // Ensure that if the map is zoomed out such that multiple 
                    // copies of the feature are visible, the popup appears over 
                    // the copy being pointed to.
                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                    }

                    new mapboxgl.Popup()
                        .setLngLat(coordinates)
                        .setHTML(description)
                        .addTo(map);
                });

                // Change the cursor to a pointer when the mouse is over the places layer.
                map.on('mouseenter', 'places', () => {
                    map.getCanvas().style.cursor = 'pointer';
                });

                // Defaults cursor when not hovering over the places layer
                map.on('mouseleave', 'places', () => {
                    map.getCanvas().style.cursor = '';
                });
            });
        }
    );
}


//-----------------------------------------------------
// Add pin for showing where the user is.
// This is a separate function so that we can use a different
// looking pin for the user
//------------------------------------------------------
function addUserPinCustomImage(map) {
    map.loadImage(
        'https://cdn-icons-png.flaticon.com/512/61/61168.png',
        (error, image) => {
            if (error) throw error;

            // Add the image to the map style with width and height values
            map.addImage('userpin', image, {
                width: 10,
                height: 10
            });

            // Adds user's current location as a source to the map
            navigator.geolocation.getCurrentPosition(position => {
                const userLocation = [position.coords.longitude, position.coords.latitude];
                console.log(userLocation);
                if (userLocation) {
                    map.addSource('userLocation', {
                        'type': 'geojson',
                        'data': {
                            'type': 'FeatureCollection',
                            'features': [{
                                'type': 'Feature',
                                'geometry': {
                                    'type': 'Point',
                                    'coordinates': userLocation
                                },
                                'properties': {
                                    'description': 'Your location'
                                }
                            }]
                        }
                    });

                    // Creates a layer above the map displaying the user's location
                    map.addLayer({
                        'id': 'userLocation',
                        'type': 'symbol',
                        'source': 'userLocation',
                        'layout': {
                            'icon-image': 'userpin', // Pin Icon
                            'icon-size': 0.05, // Pin Size
                            'icon-allow-overlap': true // Allows icons to overlap
                        }
                    });

                    // Map On Click function that creates a popup displaying the user's location
                    map.on('click', 'userLocation', (e) => {
                        // Copy coordinates array.
                        const coordinates = e.features[0].geometry.coordinates.slice();
                        const description = e.features[0].properties.description;

                        new mapboxgl.Popup()
                            .setLngLat(coordinates)
                            .setHTML(description)
                            .addTo(map);
                    });

                    // Change the cursor to a pointer when the mouse is over the userLocation layer.
                    map.on('mouseenter', 'userLocation', () => {
                        map.getCanvas().style.cursor = 'pointer';
                    });

                    // Defaults
                    // Defaults cursor when not hovering over the userLocation layer
                    map.on('mouseleave', 'userLocation', () => {
                        map.getCanvas().style.cursor = '';
                    });
                }
            });
        }
    );
}

//-----------------------------------------------------
// Add pin for showing where the user is.
// This is a separate function so that we can use a different
// looking pin for the user.  
// This version uses a pin that is just a circle. 
//------------------------------------------------------
function addUserPinCircle() {

    // Adds user's current location as a source to the map
    navigator.geolocation.getCurrentPosition(position => {
        userLocation = [position.coords.longitude, position.coords.latitude];
        currentLocation = userLocation;
        console.log("inside addUserPinCircle userLoc " + userLocation + "currentLoc " + currentLocation);
        if (userLocation) {
            map.addSource('userLocation', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [{
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': userLocation
                        },
                        'properties': {
                            'description': 'Your location'
                        }
                    }]
                }
            });

            // Creates a layer above the map displaying the pins
            // Add a layer showing the places.
            map.addLayer({
                'id': 'userLocation',
                'type': 'circle', // what the pins/markers/points look like
                'source': 'userLocation',
                'paint': { // customize colour and size
                    'circle-color': 'blue',
                    'circle-radius': 6,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff'
                }
            });

            // Map On Click function that creates a popup displaying the user's location
            map.on('click', 'userLocation', (e) => {
                // Copy coordinates array.
                const coordinates = e.features[0].geometry.coordinates.slice();
                const description = e.features[0].properties.description;

                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(description)
                    .addTo(map);
            });

            // Change the cursor to a pointer when the mouse is over the userLocation layer.
            map.on('mouseenter', 'userLocation', () => {
                map.getCanvas().style.cursor = 'pointer';
            });

            // Defaults
            // Defaults cursor when not hovering over the userLocation layer
            map.on('mouseleave', 'userLocation', () => {
                map.getCanvas().style.cursor = '';
            });
        }
    });
}

function addCustomLocations() {

}

// Call the function to display the map with the user's location and event pins
showMap();