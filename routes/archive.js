var express = require('express');
var router = express.Router();
var config = require('../config');
var models = require('../models');
var moment = require('moment');//генерирует читабельную дату
moment.locale('ru');//Будет писать на русском языке
var showdown = require('showdown');

async function posts(req, res) {
  var userId = req.session.userId;
  var userLogin = req.session.userLogin;
  var perPage = +config.PER_PAGE;
  var page = req.params.page || 0;

  try {
    let posts = await models.Post.find({
      status: 'published'
    })
    .sort({$natural:-1}).skip(perPage * page - page)
    .limit(perPage).populate('owner');

    var converter = new showdown.Converter();

    posts = posts.map(post => {
      let body = post.body;
      if(post.uploads.length) {
        post.uploads.forEach(upload => {
          body = bode.replace(`imege${upload.id}`, 
          `/${config.DESTINATION}${upload.path}`);
        })
      }
      return Object.assign(post, {
        body: converter.makeHtml(body)
      });
    });

    //console.log(posts);

    const count = await models.Post.count();

    res.render('archive/index', {
      posts,
      current: page,
      pages: Math.ceil(count/perPage),
      user: {
        id: userId,
        login: userLogin
      }
    });
  } catch (error) {
    throw new Error('Server Error');
  }
 
  /*models.Post.find({}).sort({$natural:-1}).skip(perPage * page - page)
  .limit(perPage).populate('owner').then(posts => {
    models.Post.count().then(count => {
      res.render('archive/index', {
        posts,
        current: page,
        pages: Math.ceil(count/perPage),
        user: {
          id: userId,
          login: userLogin
        }
      });
    }).catch(() => {
      throw new Error('Server Error');
    })
  }).catch(() => {
    throw new Error('Server Error');
  });*/
}

//routers
router.get('/', (req, res) => posts(req, res));
router.get('/archive/:page', (req, res) => posts(req, res));
router.get('/posts/:post', async (req, res, next) => {
  var url = req.params.post.trim().replace(/ +(?= )/g, '');
  var userId = req.session.userId;
  var userLogin = req.session.userLogin;

    if(!url) { 
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
    } else {
      try {
        const post =  await models.Post.findOne({
          url,
          status: 'published'
        }).populate('uploads');
        if(!post) {
          var err = new Error('Not Found');
          err.status = 404;
          next(err);
        } else {
          var comments = await models.Comment.find({
            post: post.id,
            parent: {
              $exists: false
            }
          });

          //
          var converter = new showdown.Converter();
          let body = post.body;
          if(post.uploads.length) {
            post.uploads.forEach(upload => {
              body = bode.replace(`imege${upload.id}`, 
              `/${config.DESTINATION}${upload.path}`);
            })
          };

          res.render('post/post', {
            post: Object.assign(post, {
                  body: converter.makeHtml(body)
                  }),
            comments,
            moment,
            user: {
              id: userId,
              login: userLogin
            }
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  /*if(!url) { 
    /**Хрен его знает зачем это надо
     * Если у нас нет данного url то и так ошибка передается на мидлвер
     * и обрабатывается ошибка 404
     * Зачем ее еще и здесь обрабатывать
     *
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  } else {
    models.Post.findOne({
      url
    }).then(post => {
      if(!post) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
      } else {
        var _post = post.id;
        var _url = 'vika';
        var comments = models.Comment.find({
          _post
        });
        res.render('post/post', {
          post,
          comments,
          user: {
            id: userId,
            login: userLogin
          }
        });
      }
    }).catch(err => {
      console.log(err);
    });
  }*/
);
router.get('/users/:login/:page*?', async (req, res) => {
  var userId = req.session.userId;
  var userLogin = req.session.userLogin;
  var perPage = +config.PER_PAGE;
  var page = req.params.page || 0;
  var login = req.params.login;

  try {
    const user = await models.User.findOne({login});

    let posts = await models.Post.find({owner: user.id})
    .sort({createdAt:-1}).skip(perPage * page - perPage)
    .limit(perPage).populate('uploads');

    const count = await models.Post.count({owner: user.id});

    var converter = new showdown.Converter();

    posts = posts.map(post => {
      let body = post.body;
      if(post.uploads.length) {
        post.uploads.forEach(upload => {
          body = bode.replace(`imege${upload.id}`, 
          `/${config.DESTINATION}${upload.path}`);
        })
      }
      return Object.assign(post, {
        body: converter.makeHtml(body)
      });
    });

    res.render('archive/user', {
      posts,
      _user: user,
      current: page,
      pages: Math.ceil(count/perPage),
      user: {
        id: userId,
        login: userLogin
      }
    });
  } catch (error) {
    throw new Error('Server Error');
  }

  /*models.User.findOne({
    login
  }).then(user => {
    models.Post.find({
      owner: user.id
    }).sort({$natural:-1}).skip(perPage * page - page)
    .limit(perPage).then(posts => {
      models.Post.count({
        owner: user.id
      }).then(count => {
        res.render('archive/user', {
          posts,
          _user: user,
          current: page,
          pages: Math.ceil(count/perPage),
          user: {
            id: userId,
            login: userLogin
          }
        });
      }).catch(() => {
        throw new Error('Server Error');
      })
    }).catch(() => {
      throw new Error('Server Error');
    });
  })*/
});

module.exports = router;