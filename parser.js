var a = require('text-encoding')
var request = require('request');
var Buffer = require('buffer').Buffer;
var Iconv  = require('iconv').Iconv;
var assert = require('assert');
var parseString = require('xml2js').parseString;
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/parser');
var Item = mongoose.model('Item',
  { 
    title: String,
    cover: String,
    desc: String,
    category: Array
  });

var Category = mongoose.model('Category', 
  {
    id: Number,
    title: String
  });


  //the whole response has been recieved, so we just print it out here
  request({url: 'http://madrobots.ru/htcCatalogNew.xml', encoding: null}, function(err, response, body) {
     // convert from UTF-8 to ISO-8859-1


      var iconv = new Iconv('CP1251', 'UTF-8');
      var buffer = iconv.convert(body);
      console.log(body.toString())
    // console.log(body)
    // body = new Buffer(body, 'binary');
    // conv = new Iconv('windows-1251', 'utf8');
    // body = conv.convert(body).toString();
        // var iconv = new Iconv('UTF-8', 'ASCII');
     // iconv.convert(body.toString())
    // parseString(body, function (err, result) {
    //    return result.yml_catalog.shop[0].categories[0].category.map((item) => {
        // console.log(item["_"])

        // console.log(item._)
        // new Category({title: body, id: item["$"]["id"]}).save(function (err) {
        //   // console.log('imhere')
        //   if (err) // ...
        //   console.log('meow');
        // });
       // });
    // });
  })


mongoose.disconnect();
