"use strict";

import Home from './views/pages/home.js'
import Login from './views/pages/login.js'
import Register from './views/pages/register.js'
import Header from './views/pages/header.js'
import Footer from './views/pages/footer.js'
import Error404 from './views/pages/error404.js'
import Player from "./views/pages/player.js";
import Playlist from "./views/pages/playlist.js";
import PlaylistEdit from "./views/pages/playlistedit.js";
import Upload from "./views/pages/upload.js";
import Create from "./views/pages/create.js";
import Genre from "./views/pages/genre.js";
import Utils from './services/Utils.js'

const routes = {
    '/': Home,
    '/login': Login,
    '/register': Register,
    '/create': Create,
    '/upload': Upload,
    '/playlist/:id': Playlist,
    '/playlistedit/:id': PlaylistEdit,
    '/genre/:id': Genre,
};


const router = async () => {

    // Lazy load view element:
    const header = document.getElementById('header_container');
    const content = document.getElementById('page_container');
    const footer = document.getElementById('footer_container');
    const player = document.getElementById('player_container');

    // Render the Header and footer of the page
    header.innerHTML = await Header.render();
    await Header.after_render();
    footer.innerHTML = await Footer.render();
    await Footer.after_render();
    player.innerHTML = await Player.render();
    await Player.after_render();


    // Get the parsed URl from the addressbar
    let request = Utils.parseRequestURL()

    // Parse the URL and if it has an id part, change it with the string ":id"
    let parsedURL = (request.resource ? '/' + request.resource : '/') + (request.id ? '/:id' : '') + (request.verb ? '/' + request.verb : '')

    // Get the page from our hash of supported routes.
    // If the parsed URL is not in our list of supported routes, select the 404 page instead
    let page = routes[parsedURL] ? routes[parsedURL] : Error404
    content.innerHTML = await page.render();
    await page.after_render();

}

const routerWithoutPlayer = async () => {

    // Lazy load view element:
    const header = null || document.getElementById('header_container');
    const content = null || document.getElementById('page_container');
    const footer = null || document.getElementById('footer_container');

    // Render the Header and footer of the page
    header.innerHTML = await Header.render();
    await Header.after_render();
    footer.innerHTML = await Footer.render();
    await Footer.after_render();

    // Get the parsed URl from the addressbar
    let request = Utils.parseRequestURL()

    // Parse the URL and if it has an id part, change it with the string ":id"
    let parsedURL = (request.resource ? '/' + request.resource : '/') + (request.id ? '/:id' : '') + (request.verb ? '/' + request.verb : '')

    // Get the page from our hash of supported routes.
    // If the parsed URL is not in our list of supported routes, select the 404 page instead
    let page = routes[parsedURL] ? routes[parsedURL] : Error404
    content.innerHTML = await page.render();
    await page.after_render();

}

// Listen on hash change:

// Listen on page load:
window.addEventListener('load', router);
window.addEventListener('hashchange', routerWithoutPlayer);
