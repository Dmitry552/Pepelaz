var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autopopulate = require('mongoose-autopopulate');
var Post = require('./post');

var schema = new Schema(
  {
    //Тело коментария
    body: {
      type: String,
      required: true
    },
    //Сылка на пост
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post'
    },
    //Сылка для родителя
    perent: {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    },
    //Сылка на хозяйна
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      autopopulate: true
    },
    //сылка на детей
    children: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        autopopulate: true
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

schema.pre('save', async function(next) {
  if(this.isNew) {
    await Post.incCommentCount(this.post);
  }
  next();
});

schema.plugin(autopopulate);

//Задаем параметр чтоб id формировался без подчеркивания
schema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Comment', schema);