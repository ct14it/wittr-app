

var image = 'img/wittee.png';     // Standard icon for other people
var imageMe = 'img/me.png';       // Standard icon for me
var imageB = 'img/witteeB.png';   // Battenberg icon for other people
var imageMeB = 'img/meB.png';     // Battenberg icon for me

var markerHash = {};              // All markers are stored in a hash=>marker format in here, used to keep track of which Wittertainees have been loaded

var wittrApp = angular.module('wittr', ['ionic', 'wittr.controllers','ngMap']);
var wittrControllers = angular.module('wittr.controllers', []);

wittrApp.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (typeof device != 'undefined' && device.platform != 'windows' && window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }


  });
})

.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {

  $ionicConfigProvider.views.swipeBackEnabled(false);   // Disable the iOS ability to swipe back because it interferes with map interaction

  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.about', {
    url: '/about',
    views: {
      'menuContent': {
        templateUrl: 'templates/about.html',
        controller: 'AboutCtrl'
      }
    }
  })

  .state('app.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
      }
    }
  })

  .state('app.homenative', {
    url: '/homenative',
    views: {
      'menuContent': {
        templateUrl: 'templates/home-native-map.html',
        controller: 'HomeNativeCtrl'
      }
    }
  })

  .state('app.coc', {
    url: '/coc',
    views: {
      'menuContent': {
        templateUrl: 'templates/coc.html',
        controller: 'CodeOfConductCtrl'
      }
    }
  })

  .state('app.privacy', {
    url: '/privacy',
    views: {
      'menuContent': {
        templateUrl: 'templates/privacy.html',
        controller: 'PrivacyCtrl'
      }
    }
  })

  .state('app.settings', {
    url: '/settings',
    views: {
      'menuContent': {
        templateUrl: 'templates/settings.html',
        controller: 'SettingsCtrl'
      }
    }
  })

  .state('app.demographics', {
    url: '/demographics',
    views: {
      'menuContent': {
        templateUrl: 'templates/demographics.html',
        controller: 'DemographicsCtrl'
      }
    }
  })

    .state('app.getid', {
      url: '/getid',
      views: {
        'menuContent': {
          templateUrl: 'templates/getid.html',
          controller: 'GetIDCtrl'
        }
      }
    })

      .state('app.demo', {
        url: '/demo',
        views: {
          'menuContent': {
            templateUrl: 'templates/demo.html',
            controller: 'DemoCtrl'
          }
        }
      });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/getid');
});

/**
 * Is the provided value an integer
 * @param value
 * @returns {boolean}
 */
function isInt(value) {
  var x;
  return isNaN(value) ? !1 : (x = parseFloat(value), (0 | x) === x);
}
