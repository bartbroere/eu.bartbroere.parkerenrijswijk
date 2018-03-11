angular.module('app.controllers', [])
  
.controller('menuCtrl', ['$scope', '$stateParams',
function ($scope, $stateParams) {
}])
   
.controller('registreerKentekenCtrl', ['$rootScope', '$scope', '$stateParams',
function ($rootScope, $scope, $stateParams) {
    $rootScope.storage = window.localStorage;
    $rootScope.successfull = "";
    $scope.refreshAllData = function() {
        $.ajax({
            url: 'https://parkeren.rijswijk.nl/DVSWebAPI/api//login',
            type: 'POST',
            xhrFields: {withCredentials: true},
            data: {
                "identifier": $scope.storage.getItem('identifier'),
                "loginMethod": "Pas",
                "password": $scope.storage.getItem('password'),
                "resetCode": null,
                "asidentifier": null,
                "zipCode": null,
                "permitMediaTypeID": 1
            },
            success: function (result) {
                console.log(result);
                $rootScope.data = result;
                $rootScope.storage.setItem('data', result);
                $rootScope.permits = result.Permits[0].PermitMedias;
                $rootScope.successfull = "";
            }
        });
        $scope.$broadcast('scroll.refreshComplete');
    };
    $scope.refreshAllData();
    $scope.registreerKenteken = function(kenteken, starttijd, eindtijd) {
        var starttijd_as_date = new Date(starttijd);
        var eindtijd_as_date = new Date(eindtijd);
        $.ajax({
            url: 'https://parkeren.rijswijk.nl/DVSWebAPI/api//reservation/create',
            type: 'POST',
            xhrFields: { withCredentials: true },
            headers: { 'Authorization': 'Token ' +  $.base64.encode($rootScope.data.Token)},
            data: {
                "DateFrom": moment(starttijd_as_date).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
                "DateUntil": moment(eindtijd_as_date).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
                "LicensePlate": {
                    "Value": kenteken
                },
                "permitMediaTypeID": 1,
                "permitMediaCode": $rootScope.data.Permits[0].PermitMedias[0].Code
            },
            success: function(result) {
                $scope.successfull = "Het kenteken is aangemeld";
            }
        });
    };
}])
   
.controller('aangemeldeKentekensCtrl', ['$rootScope', '$scope', '$stateParams',
function ($rootScope, $scope, $stateParams) {
    $rootScope.storage = window.localStorage;
    $scope.refreshAllData = function() {
        $.ajax({
            url: 'https://parkeren.rijswijk.nl/DVSWebAPI/api//login',
            type: 'POST',
            xhrFields: {withCredentials: true},
            data: {
                "identifier": $rootScope.storage.getItem('identifier'),
                "loginMethod": "Pas",
                "password": $rootScope.storage.getItem('password'),
                "resetCode": null,
                "asidentifier": null,
                "zipCode": null,
                "permitMediaTypeID": 1
            },
            success: function (result) {
                $rootScope.data = result;
                $rootScope.storage.setItem('data', result);
                $rootScope.permits = result.Permits[0].PermitMedias;
            }
        });
        $scope.$broadcast('scroll.refreshComplete');
    };
    $scope.refreshAllData();
    $scope.stopAanmelding = function(reservationID) {
        $.ajax({
            url: 'https://parkeren.rijswijk.nl/DVSWebAPI/api//reservation/end',
            type: 'POST',
            xhrFields: { withCredentials: true },
            headers: { 'Authorization': 'Token ' +  $.base64.encode($rootScope.data.Token)},
            data: {
                "ReservationID": reservationID,
                "permitMediaTypeID": 1,
                "permitMediaCode": $rootScope.permits[0].Code
            },
            success: function(result){
                $scope.refreshAllData();
            }
        });
    };
}])
   
.controller('opgeslagenVergunningenCtrl', ['$rootScope', '$scope', '$stateParams',
function ($rootScope, $scope, $stateParams) {
    $rootScope.storage = window.localStorage;
    $rootScope.identifier = $rootScope.storage.getItem('identifier');
    $rootScope.password = $rootScope.storage.getItem('password');
    $scope.savePermit = function (identifier, password) {
        $.ajax({
            url: 'https://parkeren.rijswijk.nl/DVSWebAPI/api//login',
            type: 'POST',
            xhrFields: {withCredentials: true},
            data: {
                "identifier": identifier,
                "loginMethod": "Pas",
                "password": password,
                "resetCode": null,
                "asidentifier": null,
                "zipCode": null,
                "permitMediaTypeID": 1
            },
            success: function (result) {
                if ("ErrorMessage" in result) {
                    $scope.error = "Inloggen is mislukt";
                    $scope.successfull = "";
                }
                else {
                    $rootScope.storage.setItem('identifier', identifier);
                    $rootScope.storage.setItem('password', password);
                    $rootScope.identifier = identifier;
                    $rootScope.password = password;
                    $rootScope.data = result;
                    $rootScope.storage.setItem('data', result);
                    $rootScope.permits = result.Permits[0].PermitMedias;
                    $scope.successfull = "Je vergunning is opgeslagen";
                    $scope.error = "";
                }
            }
        });
    }
}])
    