var express = require('express');
var router = express.Router();
var models = require('../models');

//Comment is add
router.post('/add', async (req, res) => {
  var userId = req.session.userId;
  var userLogin = req.session.userLogin;
  
 
  if(!userId || !userLogin) {
    res.json({
      ok: false
    });
  } else {
    var post = req.body.post;
    var body = req.body.body;
    var parent = req.body.parent;
    console.log(parent);
    if(!body) {
      res.json({
        ok: false,
        error: 'Пустой комментарий!'
      });
    }
    try{
      if(!parent) {
        await models.Comment.create({
          post,
          body,
          owner: userId
        });
        res.json({
          ok: true,
          body,
          login: userLogin
        });
      } else {
        console.log(parent);
        var parentComment = await models.Comment.findById(parent);
        if(!parentComment) {
          res.json({
            ok: false
          });
        }
        const comment = await models.Comment.create({
          post,
          body,
          parent,
          owner: userId
        });
        var children = parentComment.children;
        children.push(comment.id);
        parentComment.children = children;
        await parentComment.save();
        res.json({
          ok: true,
          body,
          login: userLogin
        });
      }
    } catch (err){
      console.log(err);
      res.json({
        ok: false,
        error: 'Ошибка!'
      });
    }

  }
});

module.exports = router;