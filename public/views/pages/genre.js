import * as dbStuff from "../../services/dbStuff.js";
import Utils from '../../services/Utils.js'

let Genre = {

    render: async () => {
        let view =  /*html*/`
            <div class="context">
                <div class="playlist_block">
                    <div class="playlist_block__logo">
                        <img id="playlist_logo" src="../assets/album.png" alt="">
                    </div>
                    <div>
                        <article>
                            <h1 id="playlist_name">Playlist</h1>
                            <p id="playlist_desc">Desc</p>
                        </article>
                        <div class="playlist_block__buttons">
                            <button id="btn_play" class="btn_play">
                                Listen
                            </button>
                        </div>
                    </div>
                </div>
            
            
                <section class="playlists">
                    <div class="title">
                        <h2>Tracks</h2>
                    </div>
                    <ol id="playlist_list" class="playlist__list">
                    </ol>
                </section>
            </div>
        `
        return view
    }
    , after_render: async () => {
        let playlist_logo = document.getElementById("playlist_logo");
        let playlist_name = document.getElementById("playlist_name");
        let playlist_desc = document.getElementById("playlist_desc");

        let btn_play = document.getElementById("btn_play");


        let tracksList = document.getElementById('playlist_list');
        tracksList.addEventListener("click", async function (e) {
            if (e.target && e.target.nodeName == "BUTTON") {
                dbStuff.setCurrentTracks(firebase.auth().currentUser.uid, [e.target.id]);
            }
        });
        let tracks = [];
        let request = Utils.parseRequestURLinRegularCase()
        let id = decodeURIComponent(request.id);
        let genreDoc = (await firebase.firestore().collection("genres").doc(id).get());
        let genre = genreDoc.data();


        playlist_name.innerHTML = genre.name;
        playlist_desc.innerHTML = genre.description;
        playlist_logo.src = genre.imgUrl;


        await loadTracks();

        btn_play.addEventListener("click", async function (e) {
            dbStuff.setCurrentTracks(firebase.auth().currentUser.uid, tracks);
        });

        async function loadTracks() {
            let ul = document.getElementById("playlist_list");
            await dbStuff.getTracks().then((tracksSnapshot) => {
                tracksSnapshot.forEach(async (doc) => {
                    let track = doc.data();
                    //let track = (await trackDoc.get()).data();
                    let genre = (await track.genre.get());
                    if (genreDoc.id !== genre.id) return;
                    tracks.push(track.path);
                    let author = (await track.author.get()).data();
                    let li = document.createElement('li');
                    li.className = "track";
                    li.innerHTML = `
                        <div class="track__logo">
                            <div class="track__mask">
                                <div class="track__play-link">
                                    <button  id="${track.path}" class="play btn">Play</button>
                                </div>
                            </div>
                            <img src="${author.imgUrl}" alt="album">
                        </div>
                        <div class="track__desc">
                            <div class="track__name">
                                <a>${track.name}</a>
                            </div>
                            <div class="track__author">
                                <a>${author.name}</a>
                            </div>
        
                        </div>
                    `;
                    ul.appendChild(li);
                });
            });
        }
    }
}


export default Genre;
