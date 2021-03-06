/*
Author(s) : Balraj Singh Bains, Mark Ericson Ponce Santos
Date : 14/01/2017
*/

app.controller('profile-controller', function($scope, $rootScope, $location, MiddlewareApi, $routeParams, auth, $log){
    
    // Changes the current view
    $scope.changeView = function(view){
        if(view === '/'){
            $rootScope.isOverview = true;
        }else{
            $rootScope.isOverview = false;
        }
        if(view === '/settings' || view === '/profile'){
            $location.path(view+'/'+$routeParams.username);
        }else{
            $location.path(view);
        }
    };

    // Profile page variables
    $scope.username = $routeParams.username;
    $scope.description = '';
    $scope.profilePictureUrl = '';

    $scope.theme = 'default';

    $scope.profileError = false;
    $scope.profileErrorMessage  = '';

    $scope.twitter = {};
    $scope.instagram = {};
    $scope.hasTwitterAccess = false;
    $scope.hasInstagramAccess = false;
    $scope.connectTwitterButton = 'disabled';
    $scope.searchInput;

    // Settings page variables
    $scope.saveButton = 'disabled';
    $scope.settingsError = false;
    $scope.settingsErrorMessage = '';
    $scope.settingsSuccess = false;
    $scope.settingsSuccessMessage = '';

    $scope.addAccountError = false;
    $scope.addAccountErrorMessage = '';
    $scope.addAccountSuccess = false;
    $scope.addAccountSuccessMessage = '';

    // Get user details
    MiddlewareApi.getUserDetails($scope.username)
        .then(function(data){
            $log.debug(data);
            if(data.success){
                // load user variables
                $scope.description = data.data.details.description;
                $scope.profilePictureUrl = data.data.details.profilePictureUrl;
                $scope.theme = data.data.details.theme;
                $scope.hasTwitterAccess = data.data.details.hasTwitterAccess;
                $scope.hasInstagramAccess = data.data.details.hasInstagramAccess;

                if($scope.hasTwitterAccess){
                    // Get twitter data
                    MiddlewareApi.getTwitterFeed($scope.username)
                        .then(function(data){
                            $log.debug(data);
                            if(data.success){
                                $scope.twitter.feed = data.data;
                            }else{
                                $scope.profileError = true;
                                $scope.profileErrorMessage = "Unable to retrive your tweets";
                            }
                        }).catch(function(data){
                            // Show error message
                            $scope.profileError = true;
                            $scope.profileErrorMessage = 'Internal error, please try again later.';
                        });
                }

                if($scope.hasInstagramAccess){
                    // Show success message if Instagram Auth was a success
                    if($routeParams.authSuccess === 'instagramSuccess'){
                        $scope.addAccountSuccessMessage = "Your Instagram account was successfully connected!";
                        $scope.addAccountSuccess = true;
                    }
                    // Get instagram data
                    MiddlewareApi.getInstagramFeed($scope.username)
                        .then(function(data){
                            $log.debug(data);
                            if(data.success){
                                $scope.instagram.feed = data.feed;
                            }else{
                                $scope.profileError = true;
                                $scope.profileErrorMessage = "Unable to retrive your Instagram media";
                            }
                        }).catch(function(data){
                            // Show error message
                            $scope.profileError = true;
                            $scope.profileErrorMessage = 'Internal error, please try again later.';
                        });
                }
            }else{
                $scope.profileError = true;
                $scope.profileErrorMessage = data.message;
            }
        }).catch(function(data){
            // Show error message
            $scope.profileError = true;
            $scope.profileErrorMessage = 'Internal error, please try again later.';
        });

    // Settings stuff.
    // Enables the save button
    $scope.enableSaveButton = function(){
        $scope.saveButton = '';
    };

    // On click of save button do this..
    $scope.saveSettings = function(){

        if($scope.saveButton !== 'disabled'){
            var settings = {
                description : $scope.description,
                profilePictureUrl : $scope.profilePictureUrl,
                theme : $scope.theme,
                hasInstagramAccess : $scope.hasInstagramAccess,
                hasTwitterAccess : $scope.hasTwitterAccess
            };

            MiddlewareApi.updateSettings($scope.username, settings)
                .then(function(data){
                    $log.debug(data);
                    if(data.success){
                        $scope.settingsSuccess = true;
                        $scope.settingsSuccessMessage = 'Settings updated successfully';
                    }else{
                        $scope.settingsError = true;
                        $scope.settingsErrorMessage = response.error;
                    }
                }).catch(function(data){
                    // Show error message
                    $scope.settingsError = true;
                    $scope.settingsErrorMessage = 'Internal error, please try again later.';
                });
            }
    };

    // On close of error and success section
    $scope.closeSettingsError = function(){
        $scope.settingsError = false;
    };

    $scope.closeSettingsSuccess = function(){
        $scope.settingsSuccess = false;
    };

    // Enable twitter button
    $scope.enableTwitterConnectButton = function(){
        $scope.connectTwitterButton = '';
    };

    // Connect twitter account
    $scope.connectTwitter = function(){
        if($scope.connectTwitterButton !== 'disabled'){
            MiddlewareApi.authorizeTwitter($scope.username, $scope.twitterUsername)
                .then(function(data){
                    $log.debug(data);
                    if(data.success){
                        $scope.hasTwitterAccess = true;
                        $scope.addAccountSuccess = true;
                        $scope.addAccountSuccessMessage = "Your Twitter account was successfully connected!";
                    }else{
                        $scope.addAccountError = true;
                        $scope.addAccountErrorMessage = "Your Twitter account failed to connect.";
                    }
                }).catch(function(data){
                    // Show error message
                    $scope.addAccountError = true;
                    $scope.addAccountErrorMessage = 'Internal error, please try again later.';
                });
        }
    };

    // Connect Instagram account
    $scope.connectInstagram = function(){
        MiddlewareApi.connectInstagram($scope.username);
    };

    // On close of error and success section
    $scope.closeAddAccountError = function(){
        $scope.addAccountError = false;
    };
 
    $scope.closeAddAccountSuccess = function(){
        $scope.addAccountSuccess = false;
    };

    // Logout function
    $scope.logout = function(){

        MiddlewareApi.logout($scope.username)
            .then(function(data){
                $log.debug(data);
                if(data.success){
                    window.sessionStorage.removeItem("socialHubUser");
                    window.sessionStorage.removeItem("socialHubUserToken");
                    $scope.changeView('/login');
                }else{
                    $scope.profileError = true;
                    $scope.profileErrorMessage = data.errorMessage;
                }
            }).catch(function(data){
                // Show error message
                $scope.addAccountError = true;
                $scope.addAccountErrorMessage = 'Internal error, please try again later.';
            });

    };

    // Show failed message if Instagram Auth was a failure
    if($routeParams.authSuccess === 'instagramFailed'){
        $scope.addAccountErrorMessage = "Your Instagram account failed to connect!";
        $scope.addAccountError = true;
    }

  
});