var express = require('express');
var router = express.Router();
var path = require('path');
var multer = require('multer');//расширение для загрузки файлов
var Sharp = require('sharp');//Потоки загрузки
var config = require('../config');
var mkdirp = require('mkdirp');//Для создания подкаталогов
var diskStorage = require('../utils/diskStorage');
var models = require('../models');

var rs = () => {
  Math.random().toString(36).slise(-3);
}

var storage = diskStorage({
  destination: (req, file, cb) => {
    var dir = '/' + rs() + '/' + rs();
    req.dir = dir;
    mkdirp(config.DESTINATION + dir, err => cb(err, config.DESTINATION + dir));
    //cb(null, config.DESTINATION + dir);
  },
  filename: async (req, file, cb) => {
    var userId = req.session.userId;
    var fileName = Data.now().toString(36) + path.extname(file.originalname);
    var dir = req.dir;
    console.log(req.body);

    //find post
    var post = await models.Post.findById(req.body.postId);
    if(!post) {
      var err = new Error('No Post');
      err.code = 'NOPOST';
      return cb(err);
    }

    //upload
    var upload = await models.Upload.create({
      ownere: userId,
      path: dir + '/' + fileName
    });

    //wripe to post
    var uploads = post.uploads;
    uploads.unshift(upload.id);
    post.uploads = uploads;
    await post.save();

    //
    req.filePath = dir + '/' + file.Name;
    
    cb(null, fileName);
  },
  sharp: (req, file, cb) => {
    var resizer = Sharp()
    .resize(1024, 768)
    .max()
    .withoutEnlargement()
    .toFormat('jpeg')
    .jpeg({
      quality: 40,
      progressive: true
    });
    cb(null, resizer);
  }
});

var upload = multer({
  storage: storage,
  limits: {fileSize: 2 * 1024 * 1024},
  fileFilter: (req, file, cb) => {
    var ext = path.extname(file.originalname);
    if(ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      var err = new Error('Extention');
      err.code = 'EXTENTION';
      return cb(err);
    }
    cb(null, true);
  }
}).single('file');

router.post('/image', (req, res) => {
  upload((req, res, err) => {
    let error = '';
    if(err) {
      if(err.code === 'LIMIT_FILE_SIZE') {
        error = 'Картинка не более 2 Мб!';
      }
      if(err.code === 'EXTENTION') {
        error = 'Только jpeg и png!';
      }
      if(err.code === 'NOPOST') {
        error = 'Обнови страницу!';
      }
    }
    res.json({
      ok: !error,
      error,
      filePath: req.filePath
    });
  });
});

module.exports = router;