
// Globals
var log = console.log.bind(console),
    clientSecret = '906aa4ec17d34b918f94e2df777b9c50',
    clientId = 'da326fb785c346fd89d40c226a2aac04',
    baseURI = `https://accounts.spotify.com/authorize?`,
    redirectHeaders = {
        'response_type': 'code',
        'client_id': 'da326fb785c346fd89d40c226a2aac04',
        'scope': 'user-read-recently-played', // Multiple
        'redirect_uri': 'http://localhost/Spotify_WebAPI/assets/user'
    };

// Custom console log
log('%cSpotify Web API _V0.1', 'font-weight: bold;font-size: 25px;color: green;');
log('// Welcome to Spotify Web API, Please report any errors to @beru2003 on Twitter.');


// Authorize button listener
document.getElementById('btnAuthorize').addEventListener('click', () => {

    const headerObjectKeys = Object.keys(redirectHeaders);
    for (let i=0; i<headerObjectKeys.length; i++) {
        baseURI += `${headerObjectKeys[i]}=${redirectHeaders[headerObjectKeys[i]]}&`;
    };
    window.location.href = baseURI;
});