import * as dbStuff from "../../services/dbStuff.js";
import Utils from '../../services/Utils.js'

let Playlist = {

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
                            <a id="btn_edit" class="btn_play hidden" style="color: black">
                                Edit
                            </a>
                            
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

        let request = Utils.parseRequestURLinRegularCase()
        let id = decodeURIComponent(request.id);
        let data = (await firebase.firestore().collection("playlists").doc(id).get()).data();
        let tracks = [];

        playlist_name.innerHTML = data.name;
        playlist_desc.innerHTML = data.description;
        playlist_logo.src = data.imgUrl;



        await loadTracks();

        firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser && data.createdByUser == firebaseUser.uid) {
                let btn = document.getElementById("btn_edit");
                btn.classList.remove('hidden');
                btn.href = "/#/playlistedit/" + id
            }
        });

        btn_play.addEventListener("click", async function(e){
            dbStuff.setCurrentTracks(firebase.auth().currentUser.uid, tracks);
        });
        async function loadTracks() {
            let ul = document.getElementById("playlist_list");


            await data.tracks.forEach(async (trackDoc) => {
                let track = (await trackDoc.get()).data();
                tracks.push(track.path);
                let author = (await track.author.get()).data();
                let li = document.createElement('li');
                li.className = "track";
                li.innerHTML= `
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
                                <a>${track.name}</a>
                            </div>
        
                        </div>
                    `;
                ul.appendChild(li);
            });
        }
    }
}


export default Playlist;
