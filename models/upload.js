var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    path: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

//Задаем параметр чтоб id формировался без подчеркивания
schema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Upload', schema);