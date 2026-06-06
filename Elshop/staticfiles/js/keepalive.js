(function () {
    const BACKEND_URL = "/health/";

    function pingServer() {
        fetch(BACKEND_URL, {
            method: "GET",
            cache: "no-cache"
        })
        .then(response => {
            console.log(
                "Keep Alive:",
                new Date().toLocaleTimeString(),
                response.status
            );
        })
        .catch(error => {
            console.error("Keep Alive Error:", error);
        });
    }

    pingServer();

    setInterval(pingServer, 15 * 60 * 1000);
})();
