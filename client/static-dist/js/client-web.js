/**
* The Mood App Client - Web page variant
*/
var app = angular.module('MoodAppWebClient', [ 'ngRoute', 'ngAnimate']);

/**
* Configure the Routes
*/
app.config( [ '$routeProvider', '$locationProvider', function( $routeProvider, $locationProvider ){
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

app.directive('halfDonut', function ($parse) {
  var directiveDefinitionObject = {
    restrict: 'E',
    replace: false,
    scope: {data: '&data'},
    // width: '=w', height: '=h'},
    link: function (scope, element, attrs) {
      var moodDaily = MoodGauge()
                        .width(Number(attrs.w))
                        .height(Number(attrs.h))
                        .title(attrs.title);
      var chart = d3.select(element[0]).datum(scope.data).call(moodDaily);
    }
  };
  return directiveDefinitionObject;
});

app.directive('badBars', function ($parse) {
  var directiveDefinitionObject = {
    restrict: 'E',
    replace: false,
    scope: {data: '&data'},
    // width: '=w', height: '=h'},
    link: function (scope, element, attrs) {
      var badBars = BadBars().width(Number(attrs.w));
      var chart = d3.select(element[0]).datum(scope.data).call(badBars);
    }
  };
  return directiveDefinitionObject;
});

app.controller('homeControl', ['$scope', '$window', '$http',
  function($scope, $window, $http){
  /* inital states */
  $scope.votes_done = false;
  $scope.team_code = Cookies.get("how-are-you-team-code");
  if ($scope.team_code !== undefined){
    /* get initial team stats */
    $http.get(mood_app_path+"/api/stats/"+$scope.team_code).then(function(rsp){
      $scope.weekly_range = rsp.data.weekly.range;
      $scope.weekly_mood = rsp.data.weekly.mood;
      $scope.weekly_participation = rsp.data.weekly.coverage;
      if ($scope.weekly_mood.length > 0){
        $scope.weekly_calculated = true;
      } else { $scope.weekly_calculated = false; }
      if (rsp.data.weekly.bads !== undefined){
        $scope.weekly_bads = rsp.data.weekly.bads;
      }
    });
  }

  $window.MoodApp_stm_Cookies.watch(function (votes_done, team_code) {
    $scope.votes_done = votes_done;
    $scope.team_code = team_code;
    if (team_code !== undefined && votes_done){
      $http.get(mood_app_path+"/api/stats/"+team_code).then(function(rsp){
        $scope.total = rsp.data.daily.total;
        if ($scope.total > 0){
          $scope.daily_mood = rsp.data.daily.data;
        }
        if (rsp.data.daily.bads !== undefined){
          $scope.daily_bads = rsp.data.daily.bads;
        }
      }, function(rsp){
        if (rsp.data.message !== undefined) {
          $scope.message = rsp.data.message;
        }
      });
    }
    $scope.$apply();
  });

  /* helper for getting partials url */
  $scope.getPartial = function (a) {
      // console.log("getting partial: " + a);
      return mood_app_path + '/static/partials/' + a + '.html';
  };
}]);

// app.controller('moodsAppVotesPannel', ['$scope', '$window', '$http', function($scope, $window, $http){
//   // initial state:
//   $scope.votes_done = $window.MoodApp_stm_Cookies.votes_done;
//   // $http.get($window.mood_app_path+"/api/stats/"+$window.MoodApp_stm_Cookies.team_code)
//   //   .then(function(response) {
//   //       $scope.data = response.data;
//   //   });
//
//   // starting monitors:
//   MoodApp_stm_Cookies.watch(function (a) {
//     console.log(a);
//     $scope.votes_done = a;
//     $http.get(mood_app_path+"/api/stats/"+MoodApp_stm_Cookies.team_code)
//       .then(function(response) {
//           $scope.total = response.data.daily.total;
//           if ($scope.total > 0){
//             $scope.mood_daily = response.data.daily.data;
//             $window.d3.select('#mood-daily').datum($scope.mood_daily).call($window.moodDaily);
//
//           }
//       });
//     $scope.$apply();
//   });
// }]);
