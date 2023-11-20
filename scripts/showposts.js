// Function to get the most recent Monday
function getMostRecentMonday() {
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
    const difference = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Calculate difference to Monday
    currentDate.setDate(currentDate.getDate() - difference); // Adjust to most recent Monday
    // Set time to 00:00:00 for consistency
    currentDate.setHours(0, 0, 0, 0);
    return currentDate;
}

// Function to get the first day of the Month
function getFirstDayOfMonth() {
    // Step 1: Get the current date
    var currentDate = new Date();

    // Step 2: Calculate the first day of the month
    // Set the day to 1 and keep the current month and year
    var firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Step 3: Convert to Firestore Timestamp
    // Firestore Timestamp format is Unix epoch time in milliseconds
    //var firestoreTimestamp = firstDayOfMonth.getTime();
    return firstDayOfMonth;
}

// Function to convert to Firestore Timestamp
function toFirestoreTimestamp(date) {
    return firebase.firestore.Timestamp.fromDate(date);
}

//-------------------------------------------------
// this function shows ALL the posts from the 
// stand alone posts collection
//------------------------------------------------
function showPosts() {

    // Usage
    const mostRecentMonday = getMostRecentMonday();
    const firestoreTimestampMonday = toFirestoreTimestamp(mostRecentMonday);

    console.log("Most Recent Monday:", mostRecentMonday);
    console.log("Firestore Timestamp:", firestoreTimestampMonday);

    // First day of Month:
    const firstDayOfMonth = getFirstDayOfMonth();
    const firestoreTimestampFirstDay = toFirestoreTimestamp(firstDayOfMonth);


    db.collection("posts")
        //.orderBy(...)       //optional ordering
        //.limit(3)           //optional limit

        // get from more recent Monday, to today
        //.where("last_updated", ">=", firestoreTimestampMonday)
        .where("last_updated", ">=", firestoreTimestampFirstDay)
        .get()
        .then(snap => {
            snap.forEach(doc => {
                displayPostCard(doc);
            })
        })
}
showPosts();

//------------------------------------------------------------
// this function displays ONE card, with information
// from the post document extracted (name, description, image)
//------------------------------------------------------------
function displayPostCard(doc) {
    var title = doc.data().name; // get value of the "name" key
    var desc = doc.data().description; //gets the length field
    var image = doc.data().image; //the field that contains the URL 
    console.log(doc.data());

    //clone the new card
    let newcard = document.getElementById("postCardTemplate").content.cloneNode(true);
    //populate with title, image
    newcard.querySelector('.card-title').innerHTML = title;
    newcard.querySelector('.card-image').src = image;
    newcard.querySelector('.card-description').innerHTML = desc;

    //Add code to attach attach an event listener to the delete DOM here
    //if you want to implement a 'delete' button

    //append to the posts
    document.getElementById("posts-go-here").append(newcard);

}