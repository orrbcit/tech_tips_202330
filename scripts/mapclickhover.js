function showMap() {
    // TO MAKE THE MAP APPEAR YOU MUST
    // ADD YOUR ACCESS TOKEN FROM
    // https://account.mapbox.com
    //------------------------------------------
    // Defines and initiates basic mapbox data
    //------------------------------------------
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWRhbWNoZW4zIiwiYSI6ImNsMGZyNWRtZzB2angzanBjcHVkNTQ2YncifQ.fTdfEXaQ70WoIFLZ2QaRmQ';
    const map = new mapboxgl.Map({
        container: 'map-goes-here', // Container ID
        style: 'mapbox://styles/mapbox/streets-v11', // Styling URL
        center: [-122.964274, 49.236082], // Starting position
        zoom: 8 // Starting zoom
    });

    // Add user controls to map, zoom, compass
    map.addControl(new mapboxgl.NavigationControl());

    map.on('load', () => {
        console.log("in map.on");
        addPostPins(map);
    });
}
showMap();

function addPostPins(map) {

    // READING information from "events" collection in Firestore
    db.collection('hikes').get().then(allEvents => {
        const features = []; // Defines an empty array for information to be added to
        console.log("inside db.get.then");
        allEvents.forEach(doc => {
            let coordinates = [doc.data().lng, doc.data().lat];
            let name = doc.data().name;    //must match firestore field name
            let desc = doc.data().details; //must match firestore field name
            // Pushes information into the features array
            features.push({
                'type': 'Feature',
                'properties': {
                     id: doc.id,  //store the id with each place
                     description: 
                     //NOTE: we are using the backtick (instead of single quote)
                     //      in oder to to embed literals like name into string
                     `<h5> ${name}</h5> <p> ${desc} </p>`
                },
                'geometry': {
                    'type': 'Point',
                    'coordinates': coordinates
                }
            });
        });
        map.addSource('places', {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': features
            }
        })
        // Add a layer showing the places.
        map.addLayer({
            'id': 'places',
            'type': 'circle',   // what the pins/markers/points look like
            'source': 'places',
            'paint': {
                'circle-color': '#4264fb',
                'circle-radius': 6,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff'
            }
        });

        //-----------------------------------
        // if someone clicks on a places pin
        // then show more info on that place
        //-----------------------------------
        map.on('click', 'places', (e) => {
            //Extract information about the places, and use what you need
            //const coordinates = e.features[0].geometry.coordinates.slice();
            //const description = e.features[0].properties.description;
            const id = e.features[0].properties.id;  //get the "id" field
            //alert(id);
            // re-direct to another page that gives more details about this post (by id)
            window.location.href = './eachHike.html?docID=' + id;
        });

        // Create a popup, but don't add it to the map yet.
        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
        });

        // Detect for "hover" by listening to mouse-enter
        map.on('mouseenter', 'places', (e) => {
            console.log("mouse entered!");

            // Change the cursor style as a UI indicator.
            map.getCanvas().style.cursor = 'pointer';

            // Extract info of the place that was clicked, like co-ord, description
            const coordinates = e.features[0].geometry.coordinates.slice();
            const description = e.features[0].properties.description;

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            // Populate the popup and set its coordinates
            // showing the description info, add to map
            popup.setLngLat(coordinates).setHTML(description).addTo(map);
        });

        // Once the user un-overs, clear the cursor, remove popup
        map.on('mouseleave', 'places', () => {
            map.getCanvas().style.cursor = '';
            popup.remove();
        });
    });

}