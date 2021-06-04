import * as dbStuff from './../../services/dbStuff.js'

let Home = {
    render: async () => {
        let view =  /*html*/`
        <div class="context">
            <h1>Main</h1>
            <section class="search">
             <h2>Search</h2>
                <form id="searchform" class="searchform">
                    <input placeholder="search" id="searchquery">
                </form>
            </section>
            <section class="albums">
                <div class="title">
                    <h2>Recent users playlist</h2>
                    <p>New tracks, albums, collections</p>
                </div>
                <ol id="albums_list" class="albums__list">
                </ol>
            </section>
            <section class="playlists">
                <div class="title">
                    <h2>Recent tracks</h2>
                    <p>Last tracks uploaded by users</p>
                </div>
                <ol id="playlist_list" class="playlist__list">
                </ol>
            </section>
            <aside class="genres">
                <ul id="genres_list" class="genres__list">
                </ul>
            </aside>
        </div>   
        `
        return view
    }
    , after_render: async () => {
        const tracksList = document.getElementById('playlist_list');
        await loadGenres();
        await loadTracks();
        await loadPlaylists();

        let searhForm = document.getElementById("searchform");
        let searhquery= document.getElementById("searchquery");
        searhForm.onsubmit = ()=>{
            window.location.href = '/#/search/'+ searhquery.value;
        }


        tracksList.addEventListener("click", async function (e) {
            if (e.target && e.target.nodeName == "BUTTON") {
                await dbStuff.setCurrentTracks([e.target.id]);
            }
        });
    }


}

async function loadGenres() {
    let ul = document.getElementById("genres_list");
    await dbStuff.getGenres().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let li = document.createElement('li');
            let genre = doc.data();
            li.className = "genres__item";
            li.style.backgroundColor = doc.data().color;
            li.innerHTML = `
                        <a href=${"/#/genre/" + doc.id} class="genres__link" >
        
                            <h2>${genre.name}</h2>
        
                            <picture>
                                <img src="${genre.imgUrl}" alt="genre">
                            </picture>
                        </a>
                    `;
            ul.appendChild(li);
        });
    });
}

async function loadTracks() {
    let ul = document.getElementById("playlist_list");
    await dbStuff.getTracks().then((querySnapshot) => {
        querySnapshot.forEach(async (doc) => {
            let data = doc.data();
            let author = (await data.author.get()).data();
            let li = document.createElement('li');
            li.className = "track";
            li.style.backgroundColor = doc.data().color;
            li.innerHTML = `
                        <div class="track__logo">
                            <div class="track__mask">
                                <div class="track__play-link">
                                    <button  id="${data.path}" class="play btn">Play</button>
                                </div>
                            </div>
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
            ul.appendChild(li);
        });
    });
}

async function loadPlaylists() {

    let ul = document.getElementById("albums_list");
    await dbStuff.getPlaylists().then((querySnapshot) => {
        querySnapshot.forEach(async (doc) => {
            let data = doc.data();
            let li = document.createElement('li');
            li.className = "album";
            li.style.backgroundColor = doc.data().color;
            li.innerHTML = `
                        <div class="album__logo">
                            <figure>
                                <img src="${data.imgUrl}" alt="album">
                                    <figcaption class="album__desc">
                                        <a href=${"/#/playlist/" + doc.id}>${data.name}</a>
                                    </figcaption>
                            </figure>
                            <div class="album__mask">
                                <div class="album__play-link">
                                    <button id="${doc.id}" class="btn">Play</button>
                                </div>
                            </div>
                        </div>
                        <div class="album__author">
                            <p>${data.description}</p>
                        </div>
                    `;
            ul.appendChild(li);
        });
    });


    let albumList = document.getElementById('albums_list');
    albumList.addEventListener("click", async function (e) {
        if (e.target && e.target.nodeName == "BUTTON") {

            let data = (await firebase.firestore().collection("playlists").doc(e.target.id).get()).data();
            let tracks = [];
            let promice = new Promise((resolve, reject) => {
                data.tracks.forEach(async (trackDoc, index, array) => {
                        let track = (await trackDoc.get()).data();
                        tracks.push(track.path);
                        if (index === array.length - 1) resolve();
                    }
                );
            });

            promice.then(async () => {
                await dbStuff.setCurrentTracks(tracks);
            });


        }
    });
}

export default Home;


