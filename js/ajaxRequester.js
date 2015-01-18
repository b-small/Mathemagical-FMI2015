/**
 * Created by bas on 12/12/2014.
 */
var ajaxRequester = (function () {

    var baseUrl = "https://api.parse.com/1/";
    var baseAdUrl = "https://api.parse.com/1/classes/Ads";

    var headers = {
        'X-Parse-Application-Id': 'r3IeE4OEXEoyLLSWz4m2WAQsXQo5axlPMi0jL4zV',
        'X-Parse-REST-API-Key': 'bOwmRbRMWn1HNkCeEsMPnCbUDHOXXizcKi0ErINF'
    };

    function login(username, password, success, error) {
        $.ajax({
            method: "GET",
            headers: headers,
            url: baseUrl + "login",
            data: {username: username, password: password},
            success: success,
            error: error
        });
    }

    function register(username, password, fullName, success, error) {
        $.ajax({
            method: "POST",
            headers: headers,
            url: baseUrl + "users",
            data: JSON.stringify({username: username, password: password, fullName: fullName}),
            success: success,
            error: error
        });
    }


    function getHeadersWithSessionToken(sessionToken) {
        var headersWithToken = JSON.parse(JSON.stringify(headers));
        headersWithToken['X-Parse-Session-Token'] = sessionToken;
        return headersWithToken;
    }


    function addAd(title, text, image, userId, success, error) {
        var serverUrl = 'https://api.parse.com/1/files/' + image.name;

        $.ajax({
            type: "POST",
            headers: headers,
            content: image.type,
            url: serverUrl,
            data: image,
            processData: false,
            contentType: false,
            dataType: 'json',
            success: function (data) {
                if (data) {
                    var fileName = "" + data.name;
                    var user = userSession.getCurrentUser();
                    var ad = {"Title": title, "Text": text, ACL: {}, username: {}};
                    ad.ACL[userId] = {"write": true};
                    ad.ACL["*"] = {"read": true};
                    ad.username = {
                        "__type": "Pointer",
                        "className": "_User",
                        "objectId": user.objectId
                    };
                    ad.img = {'name': fileName, '__type': "File"};
                    $.ajax({
                        type: "POST",
                        headers: headers,
                        url: baseAdUrl,
                        data: JSON.stringify(ad),
                        processData: false,
                        success: success,
                        error: error
                    });
                }
            }
        });
    }

    function editAd(sessionToken, adId, title, text, success, error) {
        var headersWithToken = getHeadersWithSessionToken(sessionToken);
        $.ajax({
            type: "PUT",
            headers: headersWithToken,
            url: baseAdUrl + '/' + adId,
            data: JSON.stringify({'Title': title, 'Text': text}),
            processData: false,
            success: success,
            error: error
        });

    }

    function deleteAd(sessionToken, adId, success, error) {
        var headersWithToken = getHeadersWithSessionToken(sessionToken);
        $.ajax({
            method: 'DELETE',
            headers: headersWithToken,
            url: baseAdUrl + "/" + adId,
            success: success,
            error: error
        });
    }


    function getAllAds(success, error) {
        $.ajax({
            method: 'GET',
            headers: headers,
            url: baseAdUrl,
            success: success,
            error: error
        });
    }

    return {
        login: login,
        register: register,
        addAd: addAd,
        getAllAds: getAllAds,
        editAd: editAd,
        deleteAd: deleteAd
    };
})();