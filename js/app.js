/**
 * Created by user on 12/10/2014.
 */
'use strict';

(function () {

    $(function () {
        registerEventHandlers();

        var currentUser = userSession.getCurrentUser();
        showHomeView();
    });

    var $adsForm = {};


    function registerEventHandlers() {
        $("#btnMenuHome").click(showHomeView);
        $("#btnShowLoginView").click(showLoginView);
        $("#btnLoginRegister").click(showRegisterView);
        $("#btnShowHomeView").click(showHomeView);
        $("#btnShowRegisterView").click(showRegisterView);
        $("#btnShowLoginViewFromRegister").click(showLoginView);
        $("#btnShowRegisterViewFromLogin").click(showRegisterView);
        $("#btnRegister").click(registerClicked);
        $("#btnLogin").click(loginClicked);
        $("#btnMenuAddAd").click(showAddAdView);
        $("#btnMenuLogout").click(logoutClicked);
        $("#btnAddAd").click(addAdClicked);
        $("#btnShowMyAds").click(showMyAdsView);
        $("#btnShowTeachers1").click(showTeachers1Clicked);
        $("#btnShowTeachers2").click(showTeachers2Clicked);
        $("#btnShowTeachers3").click(showTeachers3Clicked);
        $("#btnShowTeachers4").click(showTeachers4Clicked);
    }


    function showHomeView() {
        var currentUser = userSession.getCurrentUser();

        if (currentUser !== undefined) {
            showUserHomeView();
        } else {
            $(".exit").hide();
            $(".myProfile").hide();

            $(".enter").show();
            $("main > *").show();
            $("#login-form").hide();
            $("#register-form").hide();
        }
    }


    function showLoginView() {
        $("#study").hide();
        $("#container ").hide();
        $("#news-view").hide();
        $("#register-form").hide();
        $("#all-ads-form").hide();
        $("#login-form").show();
        $("#txtLoginUsername").val('');
        $("#txtLoginPassword").val('');
    }


    $(document).ready(function () {
        $("#add-ad-form").hide();
        $("#my-ads-form").hide();
        $("#edit-ad-form").hide();

        if (userSession.getCurrentUser()) {
            $("#welcome-screen").append('<h3 class="newsTitle">Здравей, ' + userSession.getCurrentUser().username + '</h3>').show();
        }
    });

    function showUserHomeView() {
        var currentUser = userSession.getCurrentUser();

        if (currentUser) {

            $("#login-form").hide();
            $("#register-form").hide();
            $("#container").show();
            $("#news-view").show();
            $(".myProfile").show();
            $(".exit").show();
            $(".enter").hide();
        } else {
            showHomeView();
        }
    }


    function showRegisterView() {
        $("#container").hide();
        $("#news-view").hide();
        $("#login-form").hide();
        $("#register-form").show();
        $("#txtRegisterUsername").val('');
        $("#txtRegisterPassword").val('');
        $("#txtRegisterFullName").val('');
    }


    function showAddAdView() {
        $("#my-ads-form").hide();
        $("#edit-ad-form").hide();
        $("#add-ad-form").show();
    }


    function showMyAdsView() {
        $("#add-ad-form").hide();
        $("#edit-ad-form").hide();
        $("#my-ads-form").show();
        getUserAds();
    }


    function loginClicked() {
        var username = $("#txtLoginUsername").val();
        var password = $("#txtLoginPassword").val();
        ajaxRequester.login(username, password, authSuccess, loginError);
    }


    function registerClicked() {
        var username = $("#txtRegisterUsername").val();
        var password = $("#txtRegisterPassword").val();
        var fullName = $("#txtRegisterFullName").val();
        ajaxRequester.register(username, password, fullName,
            function (data) {
                data.username = username;
                showLoginView();
            },
            registerError);
    }


    function registerError(error) {
        showAjaxError("Register failed", error);
    }


    function addAdClicked() {
        var title = $("#txtAdTitle").val();
        var text = $("#txtAdText").val();

        var currentUser = userSession.getCurrentUser();
        ajaxRequester.addAd(title, text, ad.Image, currentUser.objectId,
            addAdSuccessful, addAdError);
    }

    function getUserAds() {
        var currentUser = userSession.getCurrentUser();
        if (currentUser) {
            $adsForm = $("#ads");

            var response = ajaxRequester.getAllAds(loadAdsSuccess, loadAdsError);
        } else {
            showHomeView();
        }
    }


    function loadAdsSuccess(data) {

        $adsForm.html("");

        <!-- in order to get only user ads for the myProfile.html list ads page -->
        if ($adsForm.selector === '#ads') {
            console.log(userSession.getCurrentUser().objectId);
            for (var ad in data.results) {
                if (data.results[ad].username.objectId !== userSession.getCurrentUser().objectId) {
                    data.results[ad] = undefined;
                }
            }
        }

        for (var p in data.results) {
            if (data.results[p] !== undefined) {
                var ad = data.results[p];
                var $adDiv = $('<div class="ad">');
                var $row = $('<div class="row">');
                var $innerDiv = $('<div class="col-lg-6">');


                var $title = $('<h4>');
                $title.text(ad.Title);
                $title.append($('<br/><br/><br/><br/>'));
                $innerDiv.append($title);

                var $text = $('<p>');
                $text.append(ad.Text);
                $innerDiv.append($text);

                $row.append($innerDiv);
                var $pictureDiv = $('<div class="col-lg-6" id="adImages">');
                if (ad.img) {
                    var $picture = $("<img class='" + "adImg" + "' src='" + ad.img.url + "'>");
                }
                $pictureDiv.append($picture);
                $row.append($pictureDiv);

                if ($adsForm.selector == '#ads') {
                    var $buttons = $('<div class="buttons">');
                    $buttons.data("ad", ad);

                    var $editButton = $('<a href="#" class="btn btn-primary">Промени</a>');
                    $editButton.click(editAdClicked);

                    $buttons.append($editButton);
                    $buttons.append("  ");

                    var $deleteButton = $('<a href="#" class="btn btn-primary">Изтрий</a>');
                    $deleteButton.click(deleteAdButtonClicked);
                    $buttons.append($deleteButton);

                    $row.append($buttons);
                }
                $adDiv.append($row);
                $adsForm.append($adDiv);
                $adsForm.append($('<br/>')).append($('<br/>'));
            }
        }
        $adsForm.show();
    }


    function editAdClicked() {
        ad = $(this).parent().data('ad');
        console.log($(this).parent().data('ad'));

        $("#ads").hide();
        $("#edit-ad-form").show();

        var currentUser = userSession.getCurrentUser();
        var sessionToken = currentUser.sessionToken;


        $(".txtEditAdTitle").val(ad.Title);
        $(".txtEditAdText").val(ad.Text);

        $("#applyEditAd").click(function () {
            ajaxRequester.editAd(sessionToken, ad.objectId, $(".txtEditAdTitle").val(),
                $(".txtEditAdText").val(), editAdSuccessful, editAdError)
        });
    }

    function deleteAdButtonClicked() {
        var ad = $(this).parent().data('ad');
        var currentUser = userSession.getCurrentUser();
        var sessionToken = currentUser.sessionToken;

        var n = noty({
            text: 'Сигурен ли си?',
            type: 'confirm',
            dismissQueue: false,
            layout: 'center',
            theme: 'defaultTheme',
            buttons: [
                {
                    addClass: 'btn', text: 'Изтрий', onClick: function ($noty) {
                    ajaxRequester.deleteAd(
                        sessionToken, ad.objectId,
                        showUserHomeView, deleteAdError);
                    $noty.close();
                    noty({text: 'Успешно изтрихте обявата', type: 'success'});
                    $noty.close();
                }
                },
                {
                    addClass: 'btn btn-danger', text: 'Отмени', onClick: function ($noty) {
                    $noty.close();
                    noty({text: 'Прекратено изтриване на обявата', type: 'error'});
                }
                }
            ]
        })
    }


    var ad = {};
    $("document").ready(function () {
        $(".image").change(function fileSelected() {
            console.log(this.files[0]);
            //delete $scope.adData.imageDataUrl;
            var file = this.files[0];
            if (file.type.match(/image\/.*/)) {
                var reader = new FileReader();
                reader.onload = function () {
                    ad.Image = file;
                    console.log(ad.Image);
                    $(".image-box").html("<img src='" + reader.result + "'>");
                };
                reader.readAsDataURL(file);
            } else {
                $(".image-box").html("<p>File type not supported!</p>");
            }
        });

        var path = window.location.pathname;
        var page = path.split("/").pop();

        if (page === 'shop.html') {
            $adsForm = $("#all-ads-form");
            ajaxRequester.getAllAds(loadAdsSuccess, loadAdsError);
        }

        if (page === 'magic-technologies.html') {
            $(".teachers1").hide();
            $(".teachers2").hide();
            $(".teachers3").hide();
            $(".teachers4").hide();
        }
    });


    function showTeachers1Clicked() {
        $(".teachers2").hide();
        $(".teachers4").hide();
        $(".teachers3").hide();
        $(".teachers1").show();
    }


    function showTeachers2Clicked() {
        $(".teachers1").hide();
        $(".teachers4").hide();
        $(".teachers3").hide();
        $(".teachers2").show();
    }


    function showTeachers3Clicked() {
        $(".teachers1").hide();
        $(".teachers2").hide();
        $(".teachers4").hide();
        $(".teachers3").show();
    }


    function showTeachers4Clicked() {
        $(".teachers1").hide();
        $(".teachers2").hide();
        $(".teachers3").hide();
        $(".teachers4").show();
    }


    function authSuccess(data) {
        userSession.login(data);
        showHomeView();
    }

    function loginError(error) {
        showAjaxError("Invalid login", error);
    }

    function addAdSuccessful(error) {
        document.location.href = 'index.html';
        showInfoMessage("Успешно добавяне на обява");
    }

    function addAdError(error) {
        document.location.href = 'index.html';
        showErrorMessage("Неуспешно добавяне на обява");
    }

    function loadAdsError(error) {
        document.location.href = 'index.html';
        showErrorMessage("Неуспешно зареждане на обявите");
    }

    function logoutClicked() {
        userSession.logout();
        document.location.href = 'index.html';
        showInfoMessage("Излязохте успешно");
    }

    function editAdSuccessful(error) {
        document.location.href = 'myProfile.html';
        showInfoMessage("Успешна редакция на обява!");
    }

    function editAdError(error) {
        showErrorMessage("Редакцията на обява се провали!");
        document.location.href = 'myProfile.html';
    }

    function deleteAdError(error) {
        showErrorMessage("Изтриването се провали!");
    }

    function showAjaxError(msg, error) {
        var errMsg = error.responseJSON;
        if (errMsg && errMsg.error) {
            showErrorMessage(msg + ": " + errMsg.error);
        } else {
            showErrorMessage(msg + ".");
        }
    }

    function showInfoMessage(msg) {
        noty({
                text: msg,
                type: 'info',
                layout: 'topCenter',
                timeout: 5000
            }
        );
    }

    function showErrorMessage(msg) {
        noty({
                text: msg,
                type: 'error',
                layout: 'topCenter',
                timeout: 5000
            }
        );
    }
})();