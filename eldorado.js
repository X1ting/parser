var xml2js_parseString = require('xml2js').parseString;
var exec = require('child_process').exec;
var getPictures = require('./html_parser.js').getPictures;
var fs = require('fs');
var mongoose = require('mongoose');
var xlsx = require('node-xlsx');
mongoose.connect('mongodb://localhost/benofee');
var CronJob = require('cron').CronJob;
var config =
    [
      { name: 'Эльдорадо',
        url: 'http://www.eldorado.ru/_export/new_yandex/showprice.php?id=33',
        url_prepend: 'http://www.eldorado.ru/',
        pictures_prepend_need: false,
        filename: 'eldorado.txt'
      }
    ];

var Item = mongoose.model('Item',
  {
    title: String,
    promo: {
      type: Boolean,
      default: false
    },
    price: Number,
    desc: String,
    specs: [{
        name: String,
        value: String
    }],
    photos: [String],
    recommended: [String],
    shop: String,
    count: Number,
    programs: Array,
    categories: [String],
    category: String,
    tags: [String],
    hide: {
        type: Boolean,
        default: false
    },
    shopname: String,
    ordered: {
      type: Number,
      default: 0
    },
    hide: {
      type: Boolean,
      default: false
    },
    discount: {
      type: Number,
      default: 0
    },
    action_ends: Date,
    updated: {
      type: Date,
      default: Date.now()
    },
    popularity: {
      type: Number,
      default: 0
    },
    prg6: {
      type: String
    },
    prg10: {
      type: String
    },
    prg12: {
      type: String
    },
    prg24: {
      type: String
    },
    prg36: {
      type: String
    }
});

// var job = new CronJob('20 * * * * *', function() {
  config.map(function(shop) {
    var obj = xlsx.parse(__dirname + '/r.xlsx');
    var hire10 = [];
    var hire12 = [];
    var hire24 = [];

    obj[0].data.slice(6,obj[0].data.length).forEach(function(o){
      hire10.push(o[3])
    })

    obj[1].data.slice(6,obj[1].data.length).forEach(function(o){
      hire12.push(o[3])
    })

    obj[2].data.slice(6,obj[2].data.length).forEach(function(o){
      hire24.push(o[3])
    })
    exec(('curl -X GET ' + shop.url + ' | iconv -f cp1251 -t utf8 -- > ' +  shop.filename), function(err, stdout, stderr) {
      var rs = fs.readFileSync(('./' + shop.filename));
      // console.log(err, stdout, stderr)
      // console.log(rs.toString())
      xml2js_parseString(rs.toString(), function (err, result) {
        var categories = {};
        // console.log(result)
        var timeout = 0;
        result.yml_catalog.shop[0].categories[0].category.map(function(item) {
            categories[item.$.id] = {
              name: item._,
              parentId: parseInt(item.$.parentId)}
         });
        var hire10offers = [];
        var hire12offers = [];
        var hire24offers = [];

        result.yml_catalog.shop[0].offers[0].offer.map(function(offer) {
          // console.log(offer['$'].ids)
          if(hire10.indexOf(parseInt(offer['$'].id)) != -1){
            setTimeout(function(){
              var category_array = []

              offer.categoryId.map(function(id) {
                var currCat = categories[id]
                category_array.push(currCat.name)
                do{
                  currCat = categories[currCat.parentId]
                  category_array.push(currCat.name)
                }while(parseInt(currCat.parentId) != 0);
              })
              getPictures(shop.name, offer.url[0], function(err, result){
                if (result) {
                  photos = result.images;
                  specs = result.specs;
                  var itemTitle;
                  if(offer.model[0].indexOf(offer.vendor[0]) == -1)
                    itemTitle = offer.vendor[0] +' '+offer.model[0];
                  else
                    itemTitle = offer.model[0];
                  var newItem = {
                    title: itemTitle,
                    index: offer['$'].id,
                    price: offer.price[0],
                    shop: offer.url[0],
                    photos: photos,
                    specs: specs,
                    shopname: shop.name,
                    cover: (offer.picture || {}),
                    vendor: offer.vendor[0],
                    updated: Date.now(),
                    // desc: offer.description[0],
                    categories: category_array,
                    category: category_array[category_array.length - 1],
                    tags: category_array.slice(0,category_array.length - 1),
                    prg10: 'Эльдорадо'
                  };
                  console.log(newItem.tags);
                  console.log(category_array);
                  Item.findOneAndUpdate({title: itemTitle}, newItem, {upsert: true, new: true}, function (err, item) {
                    if (err)
                      console.log('find', err);
                  });
                }
              })
            }, timeout)
            timeout += 300;
          }
          else if(hire12.indexOf(parseInt(offer['$'].id)) != -1){
            setTimeout(function(){
              var category_array = []

              offer.categoryId.map(function(id) {
                var currCat = categories[id]
                category_array.push(currCat.name)
                do{
                  currCat = categories[currCat.parentId]
                  category_array.push(currCat.name)
                }while(parseInt(currCat.parentId) != 0);
              })
              getPictures(shop.name, offer.url[0], function(err, result){
                if (result) {
                  photos = result.images;
                  specs = result.specs;
                  var itemTitle;
                  if(offer.model[0].indexOf(offer.vendor[0]) == -1)
                    itemTitle = offer.vendor[0] +' '+offer.model[0];
                  else
                    itemTitle = offer.model[0];
                  var newItem = {
                    title: itemTitle,
                    index: offer['$'].id,
                    price: offer.price[0],
                    shop: offer.url[0],
                    photos: photos,
                    specs: specs,
                    shopname: shop.name,
                    cover: (offer.picture || {}),
                    vendor: offer.vendor[0],
                    updated: Date.now(),
                    // desc: offer.description[0],
                    categories: category_array,
                    category: category_array[category_array.length - 1],
                    tags: category_array.slice(0,category_array.length - 1),
                    prg12: 'Эльдорадо'
                  };
                  console.log(newItem.category);
                  Item.findOneAndUpdate({title: itemTitle}, newItem, {upsert: true, new: true}, function (err, item) {
                    if (err)
                      console.log('find', err);
                  });
                }
              })
            }, timeout)
            timeout += 300;
          }
          else if(hire24.indexOf(parseInt(offer['$'].id)) != -1){
            setTimeout(function(){
              var category_array = [];

              offer.categoryId.map(function(id) {
                var currCat = categories[id]
                category_array.push(currCat.name)
                do{
                  currCat = categories[currCat.parentId]
                  category_array.push(currCat.name)
                }while(parseInt(currCat.parentId) != 0);
              })
              getPictures(shop.name, offer.url[0], function(err, result){
                if (result) {
                  photos = result.images;
                  specs = result.specs;
                  var itemTitle;
                  if(offer.model[0].indexOf(offer.vendor[0]) == -1)
                    itemTitle = offer.vendor[0] +' '+offer.model[0];
                  else
                    itemTitle = offer.model[0];
                  var newItem = {
                    title: itemTitle,
                    index: offer['$'].id,
                    price: offer.price[0],
                    shop: offer.url[0],
                    photos: photos,
                    specs: specs,
                    shopname: shop.name,
                    cover: (offer.picture || {}),
                    vendor: offer.vendor[0],
                    // desc: offer.description[0],
                    updated: Date.now(),
                    categories: category_array,
                    category: category_array[category_array.length - 1],
                    tags: category_array.slice(0,category_array.length - 1),
                    prg24: 'Эльдорадо'
                  };
                  console.log(newItem.category);
                  Item.findOneAndUpdate({title: itemTitle}, newItem, {upsert: true, new: true}, function (err, item) {
                    if (err)
                      console.log('find', err);
                  });
                }
              })
            }, timeout)
            timeout += 300;
          }
        })
      });
    });
  });
  /*
   * Runs every weekday (Monday through Friday)
   * at 11:30:00 AM. It does not run on Saturday
   * or Sunday.
   */
  // }, function () {
    // mongoose.disconnect();
  // },
  // true, /* Start the job right now */
  // 'America/Los_Angeles' /* Time zone of this job. */
// );