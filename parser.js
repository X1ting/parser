var parseString = require('xml2js').parseString;

var exec = require('child_process').exec;
var fs = require('fs');
exec('curl -X GET http://madrobots.ru/htcCatalogNew.xml | iconv -f cp1251 -t utf8 -- > new.txt', function(err, stdout, stderr) {
  var rs = fs.readFileSync('./new.txt');
  parseString(rs.toString(), function (err, result) {
    // console.dir(result)
    // console.log(err)
     return result.yml_catalog.shop[0].categories[0].category.map((item) => {
      console.log(item._)
     //  // new Category({title: body, id: item["$"]["id"]}).save(function (err) {
     //  //   console.log('imhere')
     //  //   if (err) // ...
     //  //   console.log('meow');
     //  // });
     });
  });
});
// var assert = require('assert');
// var url = 'http://madrobots.ru/htcCatalogNew.xml';
// var utf8 = require('utf8');
// var fs = require('fs');
// // var mongoose = require('mongoose');
// // mongoose.connect('mongodb://localhost/parser');
// // var Item = mongoose.model('Item',
// //   {
// //     title: String,
// //     cover: String,
// //     desc: String,
// //     category: Array
// //   });

// // var Category = mongoose.model('Category',
// //   {
// //     id: Number,
// //     title: String
// //   });
// curl -X GET http://madrobots.ru/htcCatalogNew.xml | iconv -f cp1251 -t utf8 --

//   //the whole response has been recieved, so we just print it out here
// request({ url: 'http://madrobots.ru/htcCatalogNew.xml', headers: { 'Accept-Charset': 'utf-8' } }, function(err, response, body) {
  // console.log(utf8.decode(body));
  // console.log(body);

   // convert from UTF-8 to ISO-8859-1
   // console.log(response);

    // var iconv = new Iconv('CP1251', 'UTF-8');
    // var buffer = iconv.convert(body);
    // console.log(buffer.toString())
    // fs.writeFileSync('./govno.txt', body);
  // console.log(body)
  // body = new Buffer(body, 'binary');
  // conv = new Iconv('windows-1251', 'utf8');
  // body = conv.convert(body).toString();
      // var iconv = new Iconv('UTF-8', 'ASCII');
   // iconv.convert(body.toString())
  // parseString(body, function (err, result) {
  //    return result.yml_catalog.shop[0].categories[0].category.map((item) => {
  //     // new Category({title: body, id: item["$"]["id"]}).save(function (err) {
  //       // console.log('imhere')
  //       // if (err) // ...
  //       // console.log('meow');
  //     // });
  //    });
  // });
// });


// // mongoose.disconnect();

// var axios = require('axios');

// axios.get(url)
// .then(function(response){
//   // var buf = iconv.encode(response.data, 'utf8');
//   // var str = iconv.decode(buf, 'utf8');
//   // console.log(buf.toString());
//   // console.log(iconv.decode(new Buffer(response.data), 'utf8'));
// })
// .catch(function(error){
//   console.log(error);
// });