var xml2js_parseString = require('xml2js').parseString;
var exec = require('child_process').exec;
var getPictures = require('./html_parser.js').getPictures;
var async = require('async');
var fs = require('fs');
var mongoose = require('mongoose');
var Item = require('./item.js');
mongoose.connect('mongodb://localhost/benofee');
var CronJob = require('cron').CronJob;
var config =
    [
      // { name: 'Связной',
      //   url: 'http://feed.tools.mgcom.ru/o.cgi?source=svyaznoy_sankt-peterburg&filter_offers=svyaznoy_credit_0_0_10',
      //   url_prepend: 'http://static.svyaznoy.ru/',
      //   pictures_prepend_need: false,
      //   filename: 'svyaznoy2.txt'
      // }
      { name: 'Эльдорадо',
        url: 'http://www.eldorado.ru/_export/new_yandex/showprice.php?id=33',
        url_prepend: 'http://www.eldorado.ru/',
        pictures_prepend_need: false,
        filename: 'eldorado.txt'
      }
    ];

var job = new CronJob('20 * * * * *', function() {
  config.map(function(shop) {
    // console.log(shop)
    exec(('curl -X GET ' + shop.url + ' | iconv -f cp1251 -t utf8 -- > ' +  shop.filename), function(err, stdout, stderr) {
      var rs = fs.readFileSync(('./' + 'svt.txt'));
      // console.log(err, stdout, stderr)
      // console.log(rs.toString())
      xml2js_parseString(rs.toString(), function (err, result) {
        var categories = {};
        // console.log(result)
        result.yml_catalog.shop[0].categories[0].category.map(function(item) {
            categories[item["$"].id] = item._
         });
        result.yml_catalog.shop[0].offers[0].offer.map(function(offer) {
          getPictures(shop.name, offer.url[0], function(err, result){
            console.log(offer.url[0])
            if (result) {
              photos = result.images;
              specs = result.specs;
              var category_array = []
              offer.categoryId.map(function(id) {
                category_array.push(categories[id])
              })
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
                desc: offer.description[0],
                categories: category_array,
                category: category_array[0]
              };
              //TODO: parse photos from site. Use cheerio
              //TODO: parse specs from site.
              //TODO:
              newItem.prg10 = 'Связной';

              if(newItem.category == "Планшеты"){
                newItem.category = "Компьютеры";
                newItem.tags = ["Планшетные ПК", offer.vendor[0]];
              }
              else if(newItem.category == "Мобильные телефоны"){
                newItem.category = "Телефоны и связь";
                newItem.tags = ["Смартфоны", offer.vendor[0]];
              }


              Item.findOneAndUpdate({title: itemTitle}, newItem, {upsert: true, new: true}, function (err, item) {
                if (err)
                  console.log('find', err);
                // if (!item) {
                //     newItem.save(function (err) {
                //       if (err){
                //         // console.log('saveitem', err)
                //       }
                //     })
                //   }
              });
            }
          })
        })
      });
    });
  });
  /*
   * Runs every weekday (Monday through Friday)
   * at 11:30:00 AM. It does not run on Saturday
   * or Sunday.
   */
  }, function () {
    // mongoose.disconnect();
  },
  true, /* Start the job right now */
  'America/Los_Angeles' /* Time zone of this job. */
);
