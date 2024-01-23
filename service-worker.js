const CACHE_NAME = "botlogcon.js";
const CACHE_WHITE_LIST = ["botlogcon.js"];

let assets = [
    "./",
    "css/bootstrap/bootstrap.min.css",
    "css/fontawesome/webfonts/a-brands-400.eot",
    "css/fontawesome/webfonts/fa-brands-400.svg",
    "css/fontawesome/webfonts/fa-brands-400.ttf",
    "css/fontawesome/webfonts/fa-brands-400.woff",
    "css/fontawesome/webfonts/fa-brands-400.woff2",
    "css/fontawesome/webfonts/fa-regular-400.eot",
    "css/fontawesome/webfonts/fa-regular-400.svg",
    "css/fontawesome/webfonts/fa-regular-400.ttf",
    "css/fontawesome/webfonts/fa-regular-400.woff",
    "css/fontawesome/webfonts/fa-regular-400.woff2",
    "css/fontawesome/webfonts/fa-solid-900.eot",
    "css/fontawesome/webfonts/fa-solid-900.svg",
    "css/fontawesome/webfonts/fa-solid-900.ttf",
    "css/fontawesome/webfonts/fa-solid-900.woff",
    "css/fontawesome/webfonts/fa-solid-900.woff2",
    "css/fontawesome/css/all.min.css",
    "css/style.css",
    "img/icons/192x192.png",
    "img/icons/256x256.png",
    "img/icons/384x384.png",
    "img/icons/512x512.png",
    "img/offline.png",
    "img/online.png",
    "js/bootstrap/bootstrap.min.js",
    "js/script.js",
    "https://fonts.googleapis.com/css2?family=Roboto&display=swap"
];

self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(assets);
        })
    );
});

self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request);
        })
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (CACHE_WHITE_LIST.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});