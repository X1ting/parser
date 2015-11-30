var cheerio = require('cheerio');
var axios = require('axios');
// var url = 'http://www.svyaznoy.ru/catalog/audiovideo/1731/36404'
// var modelName = 'Voxtel MR550'

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
      // console.log(result)
      return done(null, result);
    })
    .catch(function(error){
      // console.warn('Error', error);
      return done(err)
    });
    // find(url, modelName, function(err, result){
    //   if (result)
    //     console.log(result)
    // })
    // find(url, modelName).then((response) => {console.log(response) }).catch((e) => {console.log(e)})
}
