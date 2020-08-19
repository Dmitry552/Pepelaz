var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema(
  {
    login: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
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

module.exports = mongoose.model('User', schema);