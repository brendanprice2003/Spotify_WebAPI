import { userStruct } from '../user.js';

// Expose necessary variables to console
$(document).ready(function () {

    $.uts = () => {
        return userStruct;
    };

    $.currUser = () => {
        return userStruct.CurrentUserProfile;
    };

    $.user = () => {
        return userStruct.UserProfile;
    };

    $.upl = () => {
        return userStruct.userPlaylists;
    };
});