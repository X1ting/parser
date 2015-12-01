var cheerio = require('cheerio');
var axios = require('axios');
var exec = require('child_process').exec;
var fs = require('fs');

// var url = 'http://www.svyaznoy.ru/catalog/phone/224/2467619?city_id=171'

// var url = 'http://www.eldorado.ru/cat/detail/56000458/?utm_source=yandexmarket&utm_medium=cpc&utm_campaign=Saint-Petersburg&utm_content=56000458&utm_term=56000458'

function prepareUrl(url) {
  return url.split('?')[0] + '/specs#mainContent';
}

function isEldorado(name) {
  return name == 'Эльдорадо';
}

function prepareUrlEldorado(url) {
  return url.split('?')[0];
}

function prepareString(string){
  if (string)
    return string.replace(/(  )*/g, '').replace(/(\r\n|\n|\r)/gm," ").replace(/\/noindex/,'').replace(/noindex/, '')
  else
    return ''
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

exports.getPictures = function(shop, url, done) {
  var url_prepared = prepareUrl(url)
  if (isEldorado(shop)){
    url_prepared = prepareUrlEldorado(url)
  }
  console.log(url_prepared)
    try {
      var name = Math.random().toString().split('.')[1]
      exec(('curl -X GET ' + url_prepared + ' | iconv -f cp1251 -t utf8 -- > htmls/' + name + '.html'), function(err, stdout, stderr) {
          if (err) {
            // console.log(err)
            return (err)
          }
          var rs = fs.readFileSync(('./htmls/' + name +'.html'));
          $ = cheerio.load(rs.toString());
          // console.log(rs.toString())
          var result = {images: [], specs: []};
          if (isEldorado(shop)) {
            $('img').each(function(i, item){
              var itemN = item.parent.attribs
              if (itemN.class && itemN.href) {
                if (itemN.class == 'productMainImg noBorder') {
                  result.images.push(itemN.href)
                  // var splitted = itemN.href.split('/')
                  // if (splitted[splitted.length - 2] == '700x525')
                }
              }
            })
            $('.specificationTextTable.q-item-full-specs-table tr').each(function(i, item){
              var name = ''
              if (item.children[0])
                var name = item.children[0].children[0].data
              var value = ''
              if (item.children[1])
                value = item.children[1].children[0].data
              result.specs.push({name: name, value: value})
            })
          }
          else {
            $('.hidden.big').each(function(i, item){
              result.images.push(item.attribs.href)
            })
            $('.config-block div').each(function(i, item){
              if (item.children[0]) {
                var text = ''
                item.children.map(function(item){
                  if (item.data !== undefined)
                    text += prepareString(item.data)
                })
                if (item.parent.parent.name == 'div') {
                  var splitted = text.split(':')
                  var title = prepareString(splitted[0])
                  var value = prepareString(splitted[1])
                  if (!isBlank(title) && !isBlank(value)) {
                    result.specs.push({name: title, value: value})
                  }
                }
              }
            })
          }
        // console.log(result)
        return done(null, result);
      })
    }
    catch (err) {
      // console.log(err)
      return done(err);
    }

    // find(url, modelName, function(err, result){
    //   if (result)
    //     console.log(result)
    // })
    // find(url, modelName).then((resfunctionponse) {console.log(response) }).catfunctionch((e) {console.log(e)})
}
