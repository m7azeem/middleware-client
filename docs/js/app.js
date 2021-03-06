/*
Author(s) : Balraj Singh Bains
Date : 12/01/2017
*/

// Intialise angular application
var app = angular.module('network-application', ['ngRoute']);

// Setup routes (config -> run) 
app.config(function($routeProvider, $sceDelegateProvider) {

    $routeProvider
    .when("/", {
        templateUrl : "views/overview.html",
        controller: "overview-controller"
    })
    
    .when("/login", {
        templateUrl : "views/login.html",
        controller: "login-controller"
    })
    
    .when("/profile/:username", {
        templateUrl : "views/profile.html",
        controller: "profile-controller",
        resolve : {
            auth : function(MiddlewareApi, $route, $log, $q){
                    var deferred = $q.defer();
                    MiddlewareApi.authenticate($route.current.params.username)
                        .then(function(data){
                            $log.debug(data);
                            if(data.success){
                                deferred.resolve(data);
                            }else{
                                deferred.reject(data);
                            }
                        });
                    return deferred.promise;
                }
            }
    })

    .when("/settings/:username/:authSuccess?", {
        templateUrl : "views/settings.html",
        controller: "profile-controller",
        resolve : {
            auth : function(MiddlewareApi, $route, $log, $q){
                    var deferred = $q.defer();
                    MiddlewareApi.authenticate($route.current.params.username)
                        .then(function(data){
                            $log.debug(data);
                            if(data.success){
                                deferred.resolve(data);
                            }else{
                                deferred.reject();
                            }
                        });
                    return deferred.promise;
                }
            }
    })

    .when("/:access_token",{
        resolve : {
            catchToken : function($log, $route, $location, $http, $q, MiddlewareApi){
                // apply regex on string to get the token
                var instagramAccessToken = $route.current.params.access_token.split(/access_token=/i);
                // String is split, and token is stored in instagramAccessToken[1]
                $log.debug(instagramAccessToken[1]);
                // Get the username from cache to set redirect path
                var username = window.sessionStorage.getItem('socialHubUser');
                // Send token to backend
                var deferred = $q.defer();
                MiddlewareApi.authorizeInstagram(username, instagramAccessToken[1])
                    .then(function(data){
                        $log.debug(data);
                        if(data.success){
                            deferred.resolve(data);
                            $location.path('/settings/'+username+'/instagramSuccess');
                        }else{
                            deferred.reject(data);
                            $location.path('/settings/'+username+'/instagramFailed');
                        }
                    })
                    .catch(function(data){
                        $log.debug(data);
                        $location.path('/settings/'+username+'/instagramFailed');
                    });
            }
        }
    });

    // Whitelist some urls for video playback
    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain.  Notice the difference between * and **.
        'http://techslides.com/demos/sample-videos/**',
        'https://scontent.cdninstagram.com/**'
    ]);


});

app.run(function($rootScope){

    // Set base variables
    $rootScope.token = '';

});
