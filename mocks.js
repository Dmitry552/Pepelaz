var faker = require('faker');
var tr = require('transliter');
var models = require('./models');

var owner = '5d165a683c03d42a081abc9e';

module.exports = async () => {
  try {
    await models.Post.remove();
    Array.from({length: 20}).forEach(async (_, i) => {
      var title = faker.lorem.words(5);
      var url = `${tr.slugify(title)}-${Date.now().toString(36)}`;
      var post = await models.Post.create({
        title,
        body: faker.lorem.words(100),
        url,
        owner
      });
      console.log(post);
    });
  } catch (error) {
    console.log(error);
  }
}