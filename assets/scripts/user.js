
// Globals
var log = console.log.bind(console),
    clientSecret = '906aa4ec17d34b918f94e2df777b9c50',
    clientId = 'da326fb785c346fd89d40c226a2aac04',
    baseURI = `https://accounts.spotify.com/authorize?`,
    urlParams = new URLSearchParams(window.location.search),
    localStorage = window.localStorage;

// Custom console log
log('%cSpotify Web API _V0.1', 'font-weight: bold;font-size: 25px;color: green;');
log('// Welcome to Spotify Web API, Please report any errors to @beru2003 on Twitter.');


// Main funcs
const AuthorizeUser = async () => {

    
    // Get code and save to localStorage
    // localStorage.setItem('authCode')
};