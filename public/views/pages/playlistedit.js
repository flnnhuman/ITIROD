import * as dbStuff from './../../services/dbStuff.js'
import Utils from "../../services/Utils.js";

let Edit = {

    render: async () => {
        return  /*html*/`
            <div class="context">
                <section class="create_block">
                    <div class="create_block__info">
                        <h1>Playlist creation</h1>
                        <div>
                            <div class="img_box">
                                <img class="img_preview" src="" id="img">
                            </div>
                            <input style="display: none" type="file" id="imgUpload" name="imgUpload" accept=".jpg, .jpeg, .png">
                        </div>
                       
                        <div class="create_block__name">
                            <label for="name">Playlist name</label>
                            <input id="name" placeholder="name">
                        </div>
                    </div>
            
                    <label class="hover-btn" for="imgUpload">Upload image</label>
                    <button id="save" class="hover-btn">UPDATE</button>
                    <ol id="create_block_playlist" class="create_block__playlist"></ol>
                    <div class="search">
                        <input id="search" placeholder="search tracks">
                    </div>
                    <ol id="search_list" class="playlist__list"></ol>            
                </section>
            </div>
        `
    }
    , after_render: async () => {
        let tracks = [];

        const searchList = document.getElementById('search_list');
        const search = document.getElementById('search');
        const createList = document.getElementById("create_block_playlist");
        const saveButton = document.getElementById("save");
        const nameInput = document.getElementById("name");
        const imgUpload = document.getElementById("imgUpload");
        const img = document.getElementById("img");

        let request = Utils.parseRequestURLinRegularCase()
        let id = decodeURIComponent(request.id);
        let playlist = firebase.firestore().collection("playlists").doc(id);
        let data =  (await playlist.get()).data();
        let imgUrl = img.src =data.imgUrl;
        nameInput.value = data.name;



        let promice = new Promise((resolve, reject)=> {
            data.tracks.forEach(async (trackDoc, index, array) => {
                let track = await trackDoc.get();
                tracks.push(track);
                if (index === array.length -1) resolve();
            });
        });
        promice.then(async ()=>{
           await loadTracks();
        });

        function uuidv4() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }


        imgUpload.addEventListener('change', async (event) => {
            imgUrl = 'img/' + uuidv4() + '.jpg';

            let res = await firebase.storage().ref(imgUrl).put(event.target.files[0]);
            img.src = await firebase.storage().ref(imgUrl).getDownloadURL();
        });
        saveButton.addEventListener("click", async function (e) {
            const data = {
                name: nameInput.value,
                imgUrl: await firebase.storage().ref(imgUrl).getDownloadURL(),
                tracks: tracks.map(function (value) {
                    return firebase.firestore().collection('tracks').doc(value.id);
                }),
            };

            const res = playlist.update(data);
            window.location.href = '/';
        });
        search.addEventListener('keyup', async function (e) {
            let searchRequest = search.value.toLowerCase();
            if (searchRequest === "") {
                searchList.innerHTML = "";
                return;
            }
            await dbStuff.getTracks().then((tracksSnapshot) => {
                searchList.innerHTML = "";
                tracksSnapshot.forEach(async (doc) => {
                    let track = doc.data();
                    let author = (await track.author.get()).data();
                    if (!track.name.toLowerCase().includes(searchRequest) && !author.name.toLowerCase().includes(searchRequest)) {
                        return;
                    }
                    let li = document.createElement('li');
                    li.className = "track";
                    li.innerHTML = `
                        <button id="${doc.id}" class="btn remove">Add</button>
                            <div class="track__logo">
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
                    searchList.appendChild(li);
                });
            });
        });
        searchList.addEventListener("click", async function (e) {
            if (e.target && e.target.nodeName == "BUTTON") {
                await push(e.target.id)
            }
        });
        createList.addEventListener("click", async function (e) {
            if (e.target && e.target.nodeName == "BUTTON") {
                await exclude(e.target.id)
            }
        });

        async function push(id) {
            if (tracks.some(function (value, index, arr) {
                return value.id == id;
            })) {
                return;
            }
            let track = await firebase.firestore().collection("tracks").doc(id).get();
            tracks.push(track);
            await loadTracks();
        }

        async function exclude(id) {
            tracks = tracks.filter(function (value, index, arr) {
                return value.id != id;
            });
            await loadTracks();
        }

        async function loadTracks() {
            createList.innerHTML = "";
            for (const doc of tracks) {
                let data = doc.data();
                let author = (await data.author.get()).data();
                let li = document.createElement('li');
                li.className = "track";
                li.innerHTML = `
                        <button id="${doc.id}" class="btn remove">Delete</button>
                            <div class="track__logo">
                                <img src="${author.imgUrl}" alt="album">
                            </div>
                            <div class="track__desc">
                                <div class="track__name">
                                    <a>${data.name}</a>
                                </div>
                                <div class="track__author">
                                    <a>${author.name}</a>
                                </div>
            
                            </div>
                    `;
                createList.appendChild(li);
            }
        }
    }
}
export default Edit;
