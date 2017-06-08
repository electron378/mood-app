/**
* The Mood App Client - Web page variant
*/
var app = angular.module('TheMoodApClientWeb', [ 'ngRoute', 'ngAnimate' ]);

/**
* Configure the Routes
*/
app.config( [ '$routeProvider', '$locationProvider', function( $routeProvider, $locationProvider ){
  console.log(mood_app_path+"/static/pages/about.html");
  $routeProvider
  // Pages
  .when("/", {templateUrl: mood_app_path+"/static/pages/home.html", animation: 'first', controller: "PageCtrl"})
  .when("/anonymity", {templateUrl: mood_app_path+"/static/pages/anonymity.html", animation: 'first', controller: "PageCtrl"})
  .when("/about", {templateUrl: mood_app_path+"/static/pages/about.html", animation: 'first', controller: "PageCtrl"})
  // else home
  .otherwise("/", {redirectTo:'/'});
}]);
app.config(['$qProvider', function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}]);
app.config(['$httpProvider', function($httpProvider) {
    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }

    // Answer edited to include suggestions from comments
    // because previous version of code introduced browser-related errors

    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    // extra
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
}]);

app.controller('PageCtrl', function ( $scope, $location, $http ) {

});

app.controller('HeaderController', function ($scope, $location, $rootScope) {
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
});

app.controller('ctrl', function($scope, $rootScope){
  $rootScope.$on('$routeChangeStart', function(event, currRoute, prevRoute){
  $rootScope.animation = currRoute.animation;
  });
});

app.controller('moodsAppVotesPannel', ['$scope', '$window', '$http', function($scope, $window, $http){
  // initial state:
  $scope.votes_done = $window.MoodApp_stm_Cookies.votes_done;
  $http.get($window.mood_app_path+"/api/stats/"+$window.MoodApp_stm_Cookies.team_code)
    .then(function(response) {
        $scope.data = response.data;
    });

  // starting monitors:
  MoodApp_stm_Cookies.watch(function (a) {
    $scope.votes_done = a;
    $http.get($window.mood_app_path+"/api/stats/"+$window.MoodApp_stm_Cookies.team_code)
      .then(function(response) {
		  $scope.raw_data = response.data;
          $scope.total = response.data.opt1 + response.data.opt2 + response.data.opt3 + response.data.opt4;
          if ($scope.total > 0){
            $scope.opt1 = response.data.opt1/$scope.total*100.0;
            $scope.opt2 = response.data.opt2/$scope.total*100.0;
            $scope.opt3 = response.data.opt3/$scope.total*100.0;
            $scope.opt4 = response.data.opt4/$scope.total*100.0;
          }
      });
    $scope.$apply();
  });
}]);
