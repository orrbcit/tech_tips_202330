
//-------------------------------------------------
// this function shows ALL the posts from the 
// stand alone posts collection
//------------------------------------------------
var AllPosts =[];
var MaxPosts =0;  //will get reassigned to say, 10
var PostIndex =0;

function showPosts() {
    db.collection("posts")
        //.orderBy(...)       //optional ordering
        //.limit(3)           //optional limit
        // get from more recent Monday, to today
        //.where("last_updated", ">=", firestoreTimestampMonday)
        //.where("last_updated", ">=", firestoreTimestampFirstDay)
        .get()
        .then(snap => {
            console.log(snap.size);
            MaxPost = snap.size;
            PostIndex = 0; 
            snap.forEach(doc => {
                AllPosts.push(doc.data());
                //displayPostCard(doc);
            })
            displayPostCard(AllPosts[0]);
        })
}
showPosts();

function addNextListener(){
   // var index = MaxPost-PostIndex;
    document.getElementById("show-next").addEventListener('click', ()=>{
        displayPostCard(AllPosts[PostIndex]);
        PostIndex++;
    })
}
addNextListener();

//------------------------------------------------------------
// this function displays ONE card, with information
// from the post document extracted (name, description, image)
//------------------------------------------------------------
function displayPostCard(doc) {
    var title = doc.name; // get value of the "name" key
    var desc = doc.description; //gets the length field
    var image = doc.image; //the field that contains the URL 
    //document.getElementById("div-for-section").style.backgroundImage = "./images/logo.jpg"
    console.log(doc);

    //clone the new card
    let newcard = document.getElementById("postCardTemplate").content.cloneNode(true);
    //populate with title, image
    newcard.querySelector('.card-title').innerHTML = title;
    newcard.querySelector('.card-image').src = image;
    newcard.querySelector('.card-description').innerHTML = desc;

    //remove any old cards
    const element = document.getElementById("posts-go-here");
    while (element.firstChild){
        element.removeChild(element.firstChild);
    }

    //add the new card
    element.append(newcard);

}