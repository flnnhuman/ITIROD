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

export async function setCurrentTracks(user, id) {
    firebase.database().ref('/current_tracks/' + user).set(id);
}

export async function getPlaylistById(id) {
    return firebase.firestore().collection("playlists").doc(id).get();
}
