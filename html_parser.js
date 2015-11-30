var cheerio = require('cheerio');
var axios = require('axios');
var exec = require('child_process').exec;
var fs = require('fs');

// var url = 'http://www.svyaznoy.ru/catalog/phone/224/2467619?city_id=171'

function prepareUrl(url) {
  return url.split('?')[0] + '/specs#mainContent'
}

function prepareString(string){
  if (string)
    return string.replace(/( )*/g, '').replace(/(\r\n|\n|\r)/gm," ")
  else
    return ''
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

exports.getPictures = function(url, name, done) {
  var url_prepared = prepareUrl(url)
  console.log(url_prepared)
    try {
      exec(('curl -X GET ' + url_prepared + ' | iconv -f cp1251 -t utf8 -- > htmls/' + name + '.html'), function(err, stdout, stderr) {
          var rs = fs.readFileSync(('./htmls/' + name +'.html'));
          $ = cheerio.load(rs.toString());
          console.log(rs.toString())
          var result = {images: [], specs: []};
          $('.hidden.big').each(function(i, item){
            result.images.push(item.attribs.href)
          })
          $('.config-block div').each(function(i, item){
            if (item.children[0]) {
              if (item.children[0].data) {
                var spec  = item.children[0].data
                var splitted = spec.split(':')
                var title = prepareString(splitted[0])
                var value = prepareString(splitted[1])
                if (!isBlank(title) && !isBlank(value)) {
                  result.specs.push({name: title, value: value})
                }
              }
            }
          })
          // console.log(result)
        return done(null, result);
      })
    }
    catch (err) {
      console.log(err)
      return done(err);
    }

    // find(url, modelName, function(err, result){
    //   if (result)
    //     console.log(result)
    // })
    // find(url, modelName).then((resfunctionponse) {console.log(response) }).catfunctionch((e) {console.log(e)})
}
