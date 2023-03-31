self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open("my-cache").then((cache) => cache.addAll(["./index.html", "./app.js", "./styles.css"]))
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }

            return fetch(event.request);
        })
    );
});
