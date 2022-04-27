
// Globals
var log = console.log.bind(console),
    clientId = 'da326fb785c346fd89d40c226a2aac04',
    clientSecret = '906aa4ec17d34b918f94e2df777b9c50',
    redirectUri = `http://localhost/Spotify_WebAPI/assets/user`,
    urlParams = new URLSearchParams(window.location.search),
    navbarIcon = document.getElementById('navBarIcon'),
    localStorage = window.localStorage,
    userStruct = {};

    navbarIcon.classList.add('navBarIconAnim'); // Start animation

// Custom console log
log('%cSpotify Web API _V0.1', 'font-weight: bold;font-size: 25px;color: green;');
log('// Welcome to Spotify Web API, Please report any errors to @beru2003 on Twitter.');



const AuthorizeUser = async (code) => {

    // Make request data
    let headerData = {
        headers: {
            Authorization: `Basic ${btoa(clientId + ':' + clientSecret)}`,
            "Content-Type": "application/x-www-form-urlencoded"
        }
    };

    // Fetch access token
    let AccessTokenRequest = await axios.post('https://accounts.spotify.com/api/token', `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`, headerData);

    // Store user information and store in localStorage
    const accessToken = {
            value: AccessTokenRequest.data['access_token'],
            expires_in: 1, // AccessTokenRequest.data['expires_in']
            inception: new Date().getTime()
        },
        refreshToken = {
            value: AccessTokenRequest.data['refresh_token'],
            expires_in: 7_776_000,
            inception: new Date().getTime()
        },
        components = {
            scope:  AccessTokenRequest.data.scope,
            token_type: AccessTokenRequest.data['token_type'],
            authCode: code
        };
    
        localStorage.setItem('accessToken', JSON.stringify(accessToken));
        localStorage.setItem('refreshToken', JSON.stringify(refreshToken));
        localStorage.setItem('components', JSON.stringify(components));
};


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


const OAuthFlow = async () => {

    const rsToken = JSON.parse(localStorage.getItem('refreshToken')),
        acToken = JSON.parse(localStorage.getItem('accessToken')),
        comps = JSON.parse(localStorage.getItem('components')),
        authCode = urlParams.get('code'); // ONLY place where authCode is to be fetched from

        // Clean URL
        window.history.pushState({}, document.title, window.location.pathname);

    // Wrap in try.except for error catching
    try {

        if (!authCode && (rsToken && acToken && comps)) {
            CheckComponents();
        }

        else if (authCode && (rsToken && acToken && comps)) {
            CheckComponents();
        }

        else if (authCode && (!rsToken && !acToken && !comps)) {
            AuthorizeUser(authCode);
        }

        else {
            window.location.href = redirectUri;
        };

    } 
    catch (error) {
        console.error(error); // display error page, with error and options for user
    };

    LoadUser(authCode);
};


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


const LoadContent = async (authCode) => {

    let acToken = JSON.parse(localStorage.getItem('accessToken')),
        headerData = {
            headers: {
                Authorization: `Bearer ${acToken.value}`,
                'Content-Type': 'application/json'
            }
        };

    // Load some shit idfk
    const UserPlaylists = await axios.get(`https://api.spotify.com/v1/users/${userStruct.CurrentUserProfile.id}/playlists`, headerData);
    userStruct.userPlaylists = UserPlaylists.data;

    for (var item of UserPlaylists.data.items) {

        // Create new element for each album
        const albumImage = document.createElement('img');
        albumImage.src = item.images[0].url;
        document.querySelector(`#albums`).appendChild(albumImage);
    };

    setTimeout(() => {
        navbarIcon.classList.remove('navBarIconAnim'); // Stop loadig animation
    }, 1200);
};


OAuthFlow();

export { userStruct };