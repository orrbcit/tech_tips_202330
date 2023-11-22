var currentUser;

function displayCardsDynamically(collection) {
  let cardTemplate = document.getElementById("recipeCardTemplate");
  
  db.collection(collection)
    .get() //the collection called "recipes"
    .then((allRecipes) => {
      allRecipes.forEach((doc) => {
        var title = doc.data().name;
        var cookTime = doc.data().cook_time;
        var description = doc.data().description;
        var recipeCode = doc.data().code;
        var newCard = cardTemplate.content.cloneNode(true); // Clone the HTML template to create a new card (newCard) that will be filled with Firestore data
        var docID = doc.id;

        // update title and text and image
        newCard.querySelector(".card-title").innerHTML = title;
        newCard.querySelector(".card-time").innerHTML =
          "Total time: " + cookTime + "mins";
        newCard.querySelector(".card-text").innerHTML =
          description.slice(0, 80) + "...";
        // newCard.querySelector('.card-image').src = `../images/${recipeCode}.jpg`;
        newCard.querySelector("a").href = "eachRecipe.html?docID=" + docID;
        //newCard.querySelector("i").id = "save-" + docID;
        //newCard.querySelector("i").onclick = () => saveBookmark(docID);

        console.log(title);

        // get image URL from FireBase Storage
        const storage = firebase.storage();
        var imageRef = storage.ref(recipeCode + ".jpg");
        //console.log(imageRef);
        imageRef.getDownloadURL().then((url) => {
          console.log(url);
          localStorage.setItem(title, url);
          //newCard.querySelector(".card-image").src = url;
        });

        newCard.querySelector(".card-image").src = localStorage.getItem(title);

        currentUser.get().then((userDoc) => {
          //get bookmarks if they exist
          var bookmarks = userDoc.data().bookmarks || [];
          if (bookmarks.includes(docID)) {
            iconElement.innerHTML = "bookmark";
          }
        });

        document.getElementById(collection + "-go-here").appendChild(newCard);
      });
    });
}

function doAll() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      currentUser = db.collection("users").doc(user.uid); //global
      console.log(currentUser);
      displayCardsDynamically("recipes");

      currentUser.get().then((userDoc) => {
        var bookmarks = userDoc.data().bookmarks || [];
        let params = new URL(window.location.href);
        let isCurrentlyBookmarked = bookmarks.includes(
          params.searchParams.get("docID")
        );

        bookmarks.forEach((recipeID) => {
          var iconID = "save-" + recipeID;
          var iconElement = document.getElementById(iconID);
          let params = new URL(window.location.href);
          if (iconElement) {
            iconElement.innerHTML = "bookmark";
          }
          if (isCurrentlyBookmarked && params.searchParams.get("docID") === recipeID) {
            let bookmarkButton = document.getElementById("bookmark-button");
            bookmarkButton.innerHTML = "Bookmarked";
          }
        });
      });
    } else {
      console.log("No user is signed in");
      window.location.href = "login.html";
    }
  });
}
doAll();

function saveBookmark(recipeDocID) {
  currentUser.get().then((userDoc) => {
    var bookmarks = userDoc.data().bookmarks || [];
    var isBookmarked = bookmarks.includes(recipeDocID);

    if (isBookmarked) {
      currentUser.update({
        bookmarks: firebase.firestore.FieldValue.arrayRemove(recipeDocID),
      });
      console.log("Bookmark has been removed for " + recipeDocID);
    } else {
      currentUser.update({
        bookmarks: firebase.firestore.FieldValue.arrayUnion(recipeDocID),
      });
      console.log("Bookmark has been saved for " + recipeDocID);
    }
    var iconID = "save-" + recipeDocID;
    var iconElement = document.getElementById(iconID);
    if (iconElement) {
      iconElement.innerHTML = isBookmarked ? "bookmark_border" : "bookmark";
    }
  });
}
