var cheerio = require('cheerio');
var axios = require('axios');

function isOffer (offerStr, array) {
  var flag = false;
  array.map((item) => {if (offerStr.indexOf(item) > 0) {flag = true;}});
  return flag;
};

function prepareModel (model) {
  var result = [];
  model.split(' ').map((item) => {
    if (item.length > 3) {
      result.push(item.toLowerCase());
    }
  })
  return result;
}
exports.getPictures = function(modelName, url, done) {
  var model_array = prepareModel(modelName);
  axios.get(url)
    .then(function(response){
      $ = cheerio.load(response.data);
      var result = [];
      $('img').each(function(i, item){
        if ((item.attribs.src.indexOf('/static.svyaznoy.ru/upload/') > 0) && (isOffer(item.attribs.src, model_array)))
          result.push(item.attribs.src)
      });
      return done(null, result);
    })
    .catch(function(error){
      console.warn('Error', error);
      throw error;
    });
    // find(url, modelName, function(err, result){
    //   if (result)
    //     console.log(result)
    // })
    // find(url, modelName).then((response) => {console.log(response) }).catch((e) => {console.log(e)})
}
