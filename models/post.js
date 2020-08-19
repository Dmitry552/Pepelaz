var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var URLSlugs = require('mongoose-url-slugs');

var schema = new Schema(
  {
    title: {
      type: String
    },
    body: {
      type: String
    },
    url: {
      type: String
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      required: true,
      default: 'published'
    },
    commentCount: {
      type: Number,
      default: 0
    },
    uploads: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Upload'
      }
    ]
  },
  {
    timestamps: true
  }
);

schema.statics = {
  incCommentCount(postId) {
    return this.findByIdAndUpdate(
      postId,
      {$inc: {commentCount: 1 }},
      {new: true}
    );
  }
};

/*schema.pre('save', function(next) {
  this.url = `${tr.slugify(this.title)}-${Data.now().toString(36)} `;
  next();
});*/

/**Плагин URLSlugs превращает заголовок поста в url текст
 * который потом будет использоватся для перехода на этот
 * пост как get запрос.
 * А tr переводит русский текст латинскими буквами.
 * РАБОТАЕТ НЕ КОРЕКТНО НЕ ИСПОЛЬЗОВАТЬ
 */
/*schema.plugin(
  URLSlugs('title', {
    field: 'url',

    generator: text => tr.slugify(text)
  })
);*/

//Задаем параметр чтоб id формировался без подчеркивания
schema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Post', schema);