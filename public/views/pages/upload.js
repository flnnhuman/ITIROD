import * as dbStuff from './../../services/dbStuff.js'
import Utils from "../../services/Utils.js";

let Upload = {

    render: async () => {
        return  /*html*/`
            <div class="context">
                <section class="create_block">
                    <div class="create_block__info">
                        <h1>Track Upload</h1>
                        <div>
                            <div id="img_box" class="img_box">
                                <img class="img_preview" src="" id="img">
                            </div>
                            <input style="display: none" type="file" id="trackUpload" name="trackUpload" accept=".mp3">
                        </div>
                       
                        <div class="create_block__name">
                            <label for="name">Track name</label>
                            <input id="name" placeholder="name">
                            <p>Genre</p>
                            <select id="genre_select"></select>
                            <p id="author_name"></p>
                        </div>
                    </div>
            
                    <label class="hover-btn" for="trackUpload">Upload track</label>
                    <button id="save" class="hover-btn">Save</button>
                   <div class="search">
                        <input id="search" placeholder="search authors">
                    </div>
                    <ol id="search_list" class="playlist__list"></ol>            
                </section>
            </div>
        `
    }
    , after_render: async () => {
        let author;

        const searchList = document.getElementById('search_list');
        const search = document.getElementById('search');
        const saveButton = document.getElementById("save");
        const nameInput = document.getElementById("name");
        const trackUpload = document.getElementById("trackUpload");
        const authorNameLabel = document.getElementById("author_name");
        const img = document.getElementById("img");
        const genreSelect = document.getElementById("genre_select");
        let trackUrl;
        await loadGenres();
        function uuidv4() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }


        async function loadGenres() {
            await dbStuff.getGenres().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    let opt = document.createElement('option');
                    let genre = doc.data();
                    opt.value = doc.id;
                    opt.innerHTML = genre.name;
                    genreSelect.appendChild(opt);
                });
            });
        }
        trackUpload.addEventListener('change', async (event) => {
            trackUrl = uuidv4() + '.mp3';

            let res = await firebase.storage().ref(trackUrl).put(event.target.files[0]);
            document.getElementById("img_box").classList.add("succeed");
        });
        saveButton.addEventListener("click", async function (e) {
            const data = {
                name: nameInput.value,
                author: author,
                path: trackUrl,
                genre: firebase.firestore().collection("genres").doc(genreSelect.value)
            };

            const res = await firebase.firestore().collection('tracks').add(data);
            window.location.href = '/';
        });
        search.addEventListener('keyup', async function (e) {
            let searchRequest = search.value.toLowerCase();
            if (searchRequest === "") {
                searchList.innerHTML = "";
                return;
            }
            await dbStuff.getAuthors().then((authorSnapshot) => {
                searchList.innerHTML = "";
                authorSnapshot.forEach(async (doc) => {
                    let author = doc.data();
                    if (!author.name.toLowerCase().includes(searchRequest)) {
                        return;
                    }
                    let li = document.createElement('li');
                    li.className = "author";
                    li.innerHTML = `
                        <button id="${doc.id}" class="btn remove">Select</button>
                            <div class="author__logo">
                                <img src="${author.imgUrl}" alt="album">
                            </div>
                            <div class="track__desc">
                                <div class="track__name">
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
                author = firebase.firestore().collection("authors").doc(e.target.id);
                let data = (await author.get()).data()
                img.src = data.imgUrl;
                authorNameLabel.innerHTML = data.name;

            }
        });

    }
}
export default Upload;
