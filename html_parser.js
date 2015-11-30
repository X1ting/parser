var cheerio = require('cheerio');
var axios = require('axios');
// var url = 'http://www.svyaznoy.ru/catalog/audiovideo/1731/36404'
// var modelName = 'Voxtel MR550'

function isOffer (offerStr, array) {
  var flag = false;
  array.map(function(item) {if (offerStr.indexOf(item) > 0) {flag = true;}});
  return flag;
};

function prepareModel (model) {
  var result = [];
  model.split(' ').map(function(item) {
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
      $('.hidden.big').each(function(i, item){
        result.push(item.attribs.href)
      })
      return done(null, result);
      // console.log(result)
    })
    .catch(function(error){
      // console.warn('Error', error);
      return done(error)
    });
    // find(url, modelName, function(err, result){
    //   if (result)
    //     console.log(result)
    // })
    // find(url, modelName).then((resfunctionponse) {console.log(response) }).catfunctionch((e) {console.log(e)})
}
