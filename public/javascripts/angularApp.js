var app = angular.module('flapperNews', ['ui.router']);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      resolve: {
        postPromise: ['posts', function(posts) {
          return posts.getAll();
        }]
      }
    })
    .state('posts', {
      url: '/posts/{id}',
      templateUrl: '/posts.html',
      controller: 'PostsCtrl'
    });

  $urlRouterProvider.otherwise('home');
}]);

/*
this along with the resolve.postPromise in the above config section
adds the data in the database to be displayed along with the page,
it waits for the data before the page is displayed
*/
app.factory('posts', ['$http', function($http){
  var o = {
    posts: []
  };
  o.getAll = function() {
    return $http.get('/posts').success(function(data) {
      angular.copy(data, o.posts);
    })
  };

// We get the post data and send it to the server
o.create = function(post) {
  return $http.post('/posts', post).success(function(data){
    o.posts.push(data);
  });
}

o.upvote = function(post) {
  return $http.put('/posts/' + post._id + '/upvote').success(function(data) {
    post.upvotes += 1;
  })
}
return o;
}]);


app.controller('MainCtrl', [
'$scope',
'posts',
function($scope, posts){

// Factory posts.posts binding
  $scope.posts = posts.posts;

$scope.addPost = function(){
  if(!$scope.title || $scope.title === '') { return; }
  // we are calling the o.create method to persist the data in the database
  posts.create({
    title: $scope.title,
    link: $scope.link,
  });
  $scope.title = '';
  $scope.link = '';
};

$scope.incrementUpvotes = function(post) {
  // we are calling the o.create method to upvote a post
  posts.upvote(post)
};

}]);

app.controller('PostsCtrl', [
'$scope',
'$stateParams',
'posts',
function($scope, $stateParams, posts){

// We are pulling the right posts from our factory
    $scope.post = posts.posts[$stateParams.id];

    $scope.addComment = function(){
      if($scope.body === '') { return; }
      $scope.post.comments.push({
        body: $scope.body,
        author: 'user',
        upvotes: 0
      });
      $scope.body = '';
    };

}]);