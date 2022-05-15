// Custom console log
console.log('%cSpotify Web API _V0.1', 'font-weight: bold;font-size: 25px;color: green;');
console.log('// Welcome to Spotify Web API, Please report any errors to @beru2003 on Twitter.');

// ES6 Imports
import { InitializeEvents } from './utils/events.js';

// Globals
var log = console.log.bind(console),
    authCode,
    clientId = 'da326fb785c346fd89d40c226a2aac04',
    clientSecret = 'c9a854c9f850480bbc07942a5aec2451',
    redirectUri = `http://127.0.0.1:5500/assets/user.html`,
    baseUri = `http://127.0.0.1:5500/assets/`;

var urlParams = new URLSearchParams(window.location.search),
    navbarIcon = document.getElementById('navBarIcon'),
    localStorage = window.localStorage,
    userStruct = {};
    navbarIcon.classList.add('navBarIconAnim'); // Start animation


// Configure userStruct
userStruct.objs = {};
userStruct.objs.currView = document.getElementById('moodBoard'); // Default


// OAuth 2.0 flow
const OAuthFlow = async () => {

    var rsToken = JSON.parse(localStorage.getItem('refreshToken')),
        acToken = JSON.parse(localStorage.getItem('accessToken')),
        comps = JSON.parse(localStorage.getItem('components'));
    
        // ONLY place where authCode is to be fetched from
        authCode = urlParams.get('code');

        // Clean URL
        window.history.pushState({}, document.title, window.location.pathname);

    // Wrap in try.except for error catching
    try {

        // User comes back that has authorized beforehand
        if (!authCode && (rsToken && acToken && comps)) {
            await CheckComponents();
        }

        // User re-authorizes but has authorized beforehand
        else if (authCode && (rsToken && acToken && comps)) {
            await AuthorizeUser(authCode);
        }

        // User has not authorized beforehand
        else if (authCode && (!rsToken && !acToken && !comps)) {
            await AuthorizeUser(authCode);
        }

        // Redirect back to index html page
        else {
            window.location.href = baseUri;
        };

    } 
    catch (error) {
        console.error(error); // display error page, with error and options for user
    };

    LoadUser(authCode);
};


// Get response from Spotify API that contains access key and refresh token
const AuthorizeUser = async (authCode) => {

    // Make request data
    let headerData = {
        headers: {
            Authorization: `Basic ${btoa(clientId + ':' + clientSecret)}`,
            "Content-Type": "application/x-www-form-urlencoded"
        }
    };

    // Fetch access token
    let AccessTokenRequest = await axios.post('https://accounts.spotify.com/api/token', `grant_type=authorization_code&code=${authCode}&redirect_uri=${redirectUri}`, headerData);

    // Store user information and store in localStorage
    let accessToken = {
            value: AccessTokenRequest.data['access_token'],
            expires_in: 3_600, // One hour
            inception: new Date().getTime()
        },
        refreshToken = {
            value: AccessTokenRequest.data['refresh_token'],
            expires_in: 7_776_000, // 90 Days
            inception: new Date().getTime()
        },
        components = {
            scope:  AccessTokenRequest.data.scope,
            token_type: AccessTokenRequest.data['token_type'],
            authCode: authCode
        };
    
        localStorage.setItem('accessToken', JSON.stringify(accessToken));
        localStorage.setItem('refreshToken', JSON.stringify(refreshToken));
        localStorage.setItem('components', JSON.stringify(components));
};


// Check user components to see if they are invalid or out of date
const CheckComponents = async () => {

    var acToken = JSON.parse(localStorage.getItem('accessToken')),
        rsToken = JSON.parse(localStorage.getItem('refreshToken')),
        comps = JSON.parse(localStorage.getItem('components')),
        headerData = {
            headers: {
                Authorization: `Basic ${btoa(clientId + ':' + clientSecret)}`,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        };

    // Check if either tokens have expired
    var isAcTokenExpired = (acToken.inception + acToken['expires_in']) <= Math.round(new Date().getTime());
    if (isAcTokenExpired) {

        // Refresh access token
        await axios.post('https://accounts.spotify.com/api/token', `grant_type=refresh_token&refresh_token=${rsToken.value}`, headerData)
        .then(res => {

            acToken['expires_in'] = res.data['expires_in'];
            acToken.value = res.data['access_token'];
            acToken.inception = new Date().getTime();

            comps['token_type'] = res.data['token_type'];
            comps.scope = res.data.scope;

            localStorage.setItem('accessToken', JSON.stringify(acToken));
            localStorage.setItem('components', JSON.stringify(comps));
        });
    };
};


// Load basic user information
const LoadUser = async (authCode) => {

    let acToken = JSON.parse(localStorage.getItem('accessToken')),
        headerData = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${acToken.value}`
            }
        };
        
    const CurrentUserProfile = await axios.get('https://api.spotify.com/v1/me', headerData);
    userStruct.CurrentUserProfile = CurrentUserProfile.data;

    const UserProfile = await axios.get(`https://api.spotify.com/v1/users/${CurrentUserProfile.data.userId}`, headerData);
    userStruct.UserProfile = UserProfile.data;

    LoadContent(authCode);
};


// Load user content like user playlists and favourite tracks
const LoadContent = async () => {

    let acToken = JSON.parse(localStorage.getItem('accessToken')),
        headerData = {
            headers: {
                Authorization: `Bearer ${acToken.value}`,
                'Content-Type': 'application/json'
            }
        };

    // Get user information
    let UserInformation = await axios.get(`https://api.spotify.com/v1/me`, headerData);
    document.getElementById('btnUser').innerHTML = `${UserInformation.data.display_name}`;

    if (UserInformation.data.images[0].url) {
        let navBarIcon = document.getElementById('navBarIcon');
            navBarIcon.src = UserInformation.data.images[0].url;
            navBarIcon.style.filter = 'invert(0)';
            navBarIcon.style.borderRadius = '50px';
    };

    // Get user playlists
    let UserPlaylists = await axios.get(`https://api.spotify.com/v1/users/${userStruct.CurrentUserProfile.id}/playlists`, headerData);
    userStruct.userPlaylists = UserPlaylists.data;
    
    let ArtistAffinity = await axios.get(`https://api.spotify.com/v1/me/top/artists`, headerData),
        TracksAffinity = await axios.get(`https://api.spotify.com/v1/me/top/tracks`, headerData);

    // Create new element for each affinitised artist
    for (let AffinityArtist of ArtistAffinity.data.items) {
        let artistImage = document.createElement('img');
            artistImage.id = 'item';
            artistImage.src = AffinityArtist.images[0].url;
            document.querySelector('#items').appendChild(artistImage);
    };

    // Create new element for each affinitised track
    for (let AffinityTrack of TracksAffinity.data.items) {
        let trackImage = document.createElement('img');
            trackImage.id = 'item';
            trackImage.src = AffinityTrack.album.images[0].url;
            document.querySelector('#items').appendChild(trackImage);
    };

    // Create new element for each album
    for (let item of UserPlaylists.data.items) {

        let albumImageForMoodBoard = document.createElement('img');
            albumImageForMoodBoard.id = 'item';
            albumImageForMoodBoard.src = item.images[0].url;
            document.querySelector(`#items`).appendChild(albumImageForMoodBoard);

        let albumImageForPlaylists = document.createElement('img');
            albumImageForPlaylists.id = 'playlist';
            albumImageForPlaylists.src = item.images[0].url;
            document.querySelector(`#playlistGrid`).appendChild(albumImageForPlaylists);
            albumImageForPlaylists.addEventListener('click', () => {
                LoadPlaylistContent(item, headerData);
            });
    };

    setTimeout(() => {
        navbarIcon.classList.remove('navBarIconAnim'); // Stop loadig animation
    }, 1200);
};


// Load playlist content
const LoadPlaylistContent = async (playlist, headerData) => {

    // Toggle the view to show the resptictive playlists' content instead of grid of playlists
    document.getElementById('playlistGrid').style.display = 'none';
    document.getElementById('playlistContent').style.display = 'block';

    // Get the playlist
    let PlaylistTracks = await axios.get(`${playlist.tracks.href}`, headerData),
        rt = PlaylistTracks.data.items;

    for (let item in rt) {

        let track = document.createElement('div'),
            topSeperator = document.createElement('hr'),
            seperator = document.createElement('hr');
            
        if (item === '0') {
            topSeperator.classList.add('trackBreaker');
        };

        track.id = 'track';
        track.innerHTML = rt[item].track.name;

        track.appendChild(topSeperator);
        document.querySelector('#playlistContent').appendChild(track);
        track.appendChild(seperator);
    };
};


(async () => {

    // OAuth Flow
    await OAuthFlow();

    // Create events for HTML elements
    InitializeEvents();

})()
.catch (error => {
    console.error(error);
});

export { userStruct, baseUri, authCode };