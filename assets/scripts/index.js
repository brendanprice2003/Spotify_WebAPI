
// Globals
var log = console.log.bind(console),
    clientSecret = '906aa4ec17d34b918f94e2df777b9c50',
    clientId = 'da326fb785c346fd89d40c226a2aac04',
    url = `https://accounts.spotify.com/authorize`,
    redirectUri = 'http://127.0.0.1:5500/assets/user.html';

// Custom console log
log('%cSpotify Web API _V0.1', 'font-weight: bold;font-size: 25px;color: green;');
log('// Welcome to Spotify Web API, Please report any errors to @beru2003 on Twitter.');


// Tailing function to generate state parameter
var GenerateState = (len) => {
    let result = ' ';
    let characters ='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < len; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    };
    return result;
};


// Authorize button listener
document.getElementById('btnAuthorize').addEventListener('click', () => {

    var state = GenerateState(16);

    localStorage.setItem('stateKey', state);
    var scope = 'user-read-private user-read-email user-top-read';

    url += '?response_type=code';
    url += '&client_id=' + encodeURIComponent(clientId);
    url += '&scope=' + encodeURIComponent(scope);
    url += '&redirect_uri=' + encodeURIComponent(redirectUri);
    url += '&state=' + encodeURIComponent(state);

    window.location.href = url;
});