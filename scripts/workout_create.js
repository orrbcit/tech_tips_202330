
function writeExercises() {
    //define a variable for the collection you want to create in Firestore to populate data
    var exRef = db.collection("exercises");

    exRef.add({
        title: "push up",
        description: "go down to the mat"
    });
    exRef.add({
        title: "jumping jacks",
        description: "good one on your feet"
    });
    exRef.add({
        title: "situps",
        description: "need a mat"
    });
}

//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------
function displayCardsDynamically(collection) {
    let cardTemplate = document.getElementById("exCardTemplate"); // Retrieve the HTML element with the ID "hikeCardTemplate" and store it in the cardTemplate variable. 


    db.collection(collection).get()   //the collection called "hikes"
        .then(allDocs=> {
            //var i = 1;  //Optional: if you want to have a unique ID for each hike
            allDocs.forEach(doc => { //iterate thru each doc
                var title = doc.data().title;       // get value of the "name" key
                var details = doc.data().description;  // get value of the "details" key
                let newcard = cardTemplate.content.cloneNode(true); // Clone the HTML template to create a new card (newcard) that will be filled with Firestore data.

                var docID = doc.id; //grab the ID for that doc!
                
                //update title and text and image
                newcard.querySelector('.card-title').innerHTML = title;
                newcard.querySelector('.card-text').innerHTML = details;
                newcard.querySelector('.btn').setAttribute("onclick", 'addExercise("'+ docID + '")');

                document.getElementById(collection + "-go-here").appendChild(newcard);

            })
        })
}
displayCardsDynamically("exercises");  //input param is the name of the collection

var ExerciseList=[];

function addExercise(exID){
    console.log("inside addexercise, with ID: " + exID);
    ExerciseList.push(exID);
    console.log(ExerciseList);
}

