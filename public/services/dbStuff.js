export async function getGenres() {
    return firebase.firestore().collection("genres").get();
}

export async function getTracks() {
    return firebase.firestore().collection("tracks").get();
}

export async function getAuthors() {
    return firebase.firestore().collection("authors").get();
}

export async function getPlaylists() {
    return firebase.firestore().collection("playlists").get();
}

export async function setCurrentTracks(id) {
    firebase.auth().onAuthStateChanged(function(x) {
        if (x) {
            firebase.database().ref('/current_tracks/' + x.uid).set([]);
            firebase.database().ref('/current_tracks/' + x.uid).set(id);
        } else {
            window.location.href = '/#/login';
        }
    });
}

export async function getPlaylistById(id) {
    return firebase.firestore().collection("playlists").doc(id).get();
}
