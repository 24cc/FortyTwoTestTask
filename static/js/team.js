/**
 * Created by njuice on 02.08.15.
 */
(function(){

    var app = angular.module('team', ["ngCookies", 'ngRoute', "ngResource", "ngFacebook", 'ui.bootstrap']);

    // Config $http for django backend
    app.config(function($httpProvider , $interpolateProvider, $resourceProvider){
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
        $resourceProvider.defaults.stripTrailingSlashes = false
    });

    app.config( function( $facebookProvider ) {
        $facebookProvider.setAppId('392682690927802');
    });

    app.run(function($rootScope){
       (function(d, s, id){
             var js, fjs = d.getElementsByTagName(s)[0];
             if (d.getElementById(id)) {return;}
             js = d.createElement(s); js.id = id;
             js.src = "//connect.facebook.net/en_US/sdk.js";
             fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    });


    app.directive('inviteFriends', function () {
        return {
            restrict: 'E',
            templateUrl: '/static/html/invite_friends.html',
            controller: function($log, $scope, $http, $facebook){
                this.list = [];

                var that = this;
                // Fetch our facebook friends that we can invite
                $http.get('/invitable/', {}).success(function(data){
                    that.list = data;
                });

                this.invite = function(friend){
                    $facebook.ui({method: 'apprequests',
                        message: 'Join us - http://fortytwotesttask-168.24cc.at.getbarista.com/tasks/',
                        to: friend.id
                    });
                };

            },
            controllerAs: 'invitable_friends'
        };
    });

    // Modal window
    app.controller('Modal', function($scope, $modal, $http, $log){
        $scope.items = [];

        $http.get('/tm_invite/', {}).success(function(data){
            var i = 0,
                max = data.length;
            for( ; i < max; i += 1){
                var item = {};
                item.id = data[i]['pk'];
                item.name = data[i]['fields']['first_name'] + ' ' + data[i]['fields']['last_name'];
                $scope.items.push(item)
            }
        });

        $scope.animationsEnabled = true;

        $scope.open = function (size) {

            var modalInstance = $modal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl',
                size: size,
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.toggleAnimation = function () {
        $scope.animationsEnabled = !$scope.animationsEnabled;
        };
    });

    app.controller('ModalInstanceCtrl', function ($scope, $modalInstance, $http, $httpParamSerializer, items) {
        $scope.items = items;
        $scope.selected = {
            item: $scope.items[0]
        };

        $scope.ok = function () {
            $modalInstance.close($scope.selected.item);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.addToTeam = function(item){

            var req = {
                method: 'POST',
                url: '/tm_invite/',
                headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: $httpParamSerializer({'cmd': 'add', 'item': item})
            };

            $http(req).success(function(data){
                window.location.reload();
            });
            $modalInstance.close($scope.selected.item);

        };
    });

    app.controller('Team', function($http, $scope, $httpParamSerializer){
        $scope.remove = function(tmId){
            var req = {
                method: 'POST',
                url: '/tm_invite/',
                headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: $httpParamSerializer({'cmd': 'del', 'tmId': tmId})
            };
            $http(req).success(function(data){
                window.location.reload();
            });
        }
    });
})();