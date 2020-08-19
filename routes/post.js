var express = require('express');
var router = express.Router();
var tr = require('transliter');
var models = require('../models');

//GET for add
router.get('/add', async (req, res) => {
  var userId = req.session.userId;
  var userLogin = req.session.userLogin;

  if(!userId || !userLogin) {
    res.redirect('/');
  } else {
    try {
      var post = await models.Post.findOne({
        owner: userId,
        status: 'draft'
      });
      if(post) {
        res.redirect(`/post/edit/${post.id}`);
      } else {
        var post = await models.Post.create({
          owner: userId,
          status: 'draft'
        });
        res.redirect(`/post/edit/${post.id}`);
      }
    } catch (error) {
      console.log(error);
    }
  }
});

//Добавление поста
router.post('/add', async (req, res) => {
  var userId = req.session.userId;
  var userLogin = req.session.userLogin;

  if(!userLogin || !userLogin) {
    res.redirect('/');
  } else {
    //Чистим заголовок от пробелов и двойных пробелов
    var title = req.body.title.trim().replace(/ +(?= )/g, '');
    var body = req.body.body.trim();
    var isDraft = !!req.body.isDraft;
    var postId = req.body.postId;
    var url = `${tr.slugify(title)}-${Date.now().toString(36)}`;
    

    if(!title || !body) {
      var fields =[];
      if(!title) fields.push('title');
      if(!body) fields.push('body');

      res.json({
        ok: false,
        error: 'Все поля должны быть заполнены!',
        fields
      });
    } else if(title.length < 3 || title.length > 64) {
      res.json({
        ok: false,
        error: 'Длина заголовка от 3 до 64 символов!',
        fields: ['title']
      });
    } else if(body.length < 3) {
      res.json({
        ok: false,
        error: 'Текст не менее трех символов!',
        fields: ['body']
      });
    } else if(!postId) {
      res.json({
        ok: false
      });
    } else {
      try {
        var post = await models.Post.findOneAndUpdate({
          _id: postId,
          owner: userId
        }, {
          title,
          body,
          url,
          owner: userId,
          status: isDraft ? 'draft' : 'published'
        }, {
          new: true
        });
        if(!post) {
          res.json({
            ok: false,
            error: 'Пост не твой!'
          });
        } else {
          res.json({
            ok: true,
            post
          });
        }
      } catch (error) {
        res.json({
          ok: false
        });
      }
    }
  }
});

//Редактирование поста
router.get('/edit/:id', async (req, res, next) => {
  var id = req.params.id.trim().replace(/ +(?= )/g, '');
  var userId = req.session.userId;
  var userLogin = req.session.userLogin;

  if(!userId || !userLogin) {
    res.redirect('/');
  } else {
    try {
      var post = await models.Post.findById(id).populate('uploads');
      if(!post) { 
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
      }
      res.render('post/edit', {
        post,
        user: {
          id: userId,
          login: userLogin
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
});
 
module.exports = router;