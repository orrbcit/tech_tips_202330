//------------------------------------------------
// Call this function when the "logout" button is clicked
//-------------------------------------------------
function logout() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        console.log("logging out user");
      }).catch((error) => {
        // An error happened.
      });
}

//-----------------------------------------------------------------------
// Read the file called "items.json"
// and save it to Firestore items collection.
// The file must on on server (ie, use "Live Server") for fetch to work.
//-----------------------------------------------------------------------
function readJsonAndSaveToFirestore() {
  fetch('items.json')
    .then(response => response.json())
    .then(data => {
      // Assuming `data` is an array of objects and you have a collection called 'items'
      const batch = db.batch();
      
      data.forEach((item, index) => {
        // Here, we're generating a new document ID for each item.
        // If your items have unique IDs, use `doc(item.id)` instead.
        var docRef = db.collection('items').doc(); // Auto-generate new ID
        batch.set(docRef, item);

        // Firestore batch has a limit of 500 operations per batch.
        // If you approach this limit, you'd need to handle multiple batches.
      });

      // Commit the batch
      return batch.commit().then(() => {
        console.log('Successfully saved data to Firestore!');
      });
    })
    .catch(error => {
      console.error('Error reading JSON file or saving to Firestore:', error);
    });
}

// Call the function to start the process
//readJsonAndSaveToFirestore();
