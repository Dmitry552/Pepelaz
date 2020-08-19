var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt-nodejs');//криптография
var models = require('../models');

//POST is register
router.post('/register', (req, res) => {
  //Собираем данные которые пришли в запросе
  var login = req.body.login;
  var password = req.body.password;
  var passwordConfirm = req.body.passwordConfirm;
//проверки
  if(!login || !password || !passwordConfirm) {//Заполнены ли поля
    var fields =[];
    if(!login) fields.push('login');
    if(!password) fields.push('password');
    if(!passwordConfirm) fields.push('passwordConfirm');

    res.json({
      ok: false,
      error: 'Все поля должны быть заполнены!',
      fields
    });
  } else if(!/^[a-zA-Z0-9]+$/.test(login)) {
    res.json({
      ok: false,
      error: 'Только латинские буквы и цифры!',
      fields: ['login']
    });
  } else if(login.length < 3 || login.length > 16) {//Длина логина от 3 до 16 символов
    res.json({
      ok: false,
      error: 'Длина логина от 3 до 16 символов!',
      fields: ['login']
    });
  } else if(password.length < 4) {
    res.json({
      ok: false,
      error: 'Минимальная длина пароля 5 символов!',
      fields: ['password']
    });
  } else if(password !== passwordConfirm) {//Совпадение пароля и повторного пароля
    res.json({
      ok: false,
      error: 'Пароли не совпадают!',
      fields: ['password', 'passwordConfirm']
    });
  } else {//Если все нормально кодируем пароль с помощью bcrypt-nodejs
    models.User.findOne({//Ищем такого юзера в БД
      login
    }).then(user => {
      if(!user) {//Если такого юзера нет то можно его создать
        bcrypt.hash(password, null, null, (err, hash) => {
          models.User.create({//Создаем пользователя в БД
          login,
          password: hash
        }).then(user => {
          req.session.userId = user.id;
          req.session.userLogin = user.login;
          res.json({
            ok: true
          });
        }).catch(err => {//Если что-то не так выходим
          console.log(err);
          res.json({
            ok: false,
            error: 'Ошибка, попробуйте позже'
          });
        });
      });
      } else {
        console.log(res);
        res.json({
          ok: false,
          error: 'Имя занято!',
          fields: ['login']
        });
      }
    });
  }
  console.log(req.body);
});

//POST is autorize
router.post('/login', (req, res) => {
  var login = req.body.login;
  var password = req.body.password;

  if(!login || !password) {
    var fields =[];
    if(!login) fields.push('login');
    if(!password) fields.push('password');

    res.json({
      ok: false,
      error: 'Все поля должны быть заполнены!',
      fields
    });
  } else {
    models.User.findOne({//Ищем такого юзера в БД
      login
    }).then(user => {
      if(!user) {
        res.json({
          ok: false,
          error: 'Логин и пароль неверны!',
          fields
        });
      } else {
        bcrypt.compare(password, user.password, (err, result) => {
          if(!result) {
            res.json({
              ok: false,
              error: 'Логин и пароль неверны!',
              fields
            });
          } else {
            req.session.userId = user.id;
            req.session.userLogin = user.login;
            res.json({
              ok: true,
            });
          }
        });
      }
    }).catch(err => {
      res.json({
        ok: false,
        error: 'Ошибка, попробуйте позже'
      });
    });
  }
});

//GET for logout
router.get('/logout', (req, res) => {
  if(req.session) {
    req.session.destroy(() => {
      res.redirect('/post/add');
    });
  } else {
    //res.redirect('/');
  }
});

module.exports = router;