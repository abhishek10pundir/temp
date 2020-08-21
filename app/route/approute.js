'use strict';
module.exports = function(app) {
  var login = require('../controller/login');
  var updateProfile = require('../controller/updateProfile');
  var feeds = require('../controller/feeds');
  var likeUnlike = require('../controller/likeUnlike');
  var comment = require('../controller/comment');
  var follow = require('../controller/follow');
  var search = require('../controller/search');
  var category = require('../controller/category');


  app.route('/login').post(login.add_tasks)
  app.route('/profile/:id').put(updateProfile.add_tasks)
  app.route('po:id').get(updateProfile.get_tasks)
  app.route('/other-profile').post(updateProfile.get_other_tasks)
  app.route('/search/:keyword').get(search.search_tasks)
  app.route('/feeds').post(feeds.add_tasks)
  app.route('/feeds/:id/:user_id').get(feeds.get_tasks)
  app.route('/feeds/:id').put(feeds.update_tasks)
  app.route('/feeds/:id').delete(feeds.delete_tasks)
  app.route('/getAllFeeds/:id/:currentPage').get(feeds.get_all_tasks)
  app.route('/userfeeds/:id/:currentPage').get(feeds.get_user_tasks)
  app.route('/likeUnlike/:id').put(likeUnlike.add_tasks)
  app.route('/comment/:id').put(comment.add_tasks)
  app.route('/follow').post(follow.add_tasks)
  app.route('/follow/:id/:type').get(follow.get_tasks)
  app.route('/category').get(category.get_tasks)

  //route to get all videos or images based on requirement type=0 means images ,type=1 means videos
  app.route('/getAllFeeds/:id/:media_type/:currentPage').get(feeds.get_all_video_or_images)
  //route to get particular user videos or images based on requirement type=0 means images ,type=1 means videos
  app.route('/userfeeds/:id/:media_type/:currentPage').get(feeds.get_user_video_or_images)
};
    