import * as dbStuff from './../../services/dbStuff.js'
import Utils from "../../services/Utils.js";

let Search = {

    render: async () => {
        return  /*html*/`
            <div class="context">
                <h1 id="title"></h1>
                <section class="create_block">
                    <ol id="search_list" class="playlist__list"></ol>            
                </section>
            </div>
        `
    }
    , after_render: async () => {

        const searchList = document.getElementById('search_list');
        let request = Utils.parseRequestURLinRegularCase()
        let id = decodeURIComponent(request.id);
        document.getElementById("title").innerHTML = id;
        await loadTracks(id);
        searchList.addEventListener("click", async function (e) {
            if (e.target && e.target.nodeName == "BUTTON") {
                await dbStuff.setCurrentTracks([e.target.id]);
            }
        });

        async function loadTracks(searchRequest) {
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
                        <button id="${track.path}" class="btn remove">Play</button>
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
        }
    }
}
export default Search;
