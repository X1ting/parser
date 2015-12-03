var xml2js_parseString = require('xml2js').parseString;
var exec = require('child_process').exec;
var getPictures = require('./html_parser.js').getPictures;
var async = require('async');
var fs = require('fs');
var Item = require('./item.js');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/benofee');
var CronJob = require('cron').CronJob;

var shop = { name: 'Связной',
        url: 'http://feed.tools.mgcom.ru/o.cgi?source=svyaznoy_sankt-peterburg&filter_offers=svyaznoy_credit_0_0_10',
        url_prepend: 'http://static.svyaznoy.ru/',
        pictures_prepend_need: false,
        filename: 'svyaznoy.txt'
      }
var job = new CronJob('* 10 * * * *', function() {
  exec(('sh download.sh'), function(err, stdout, stderr) {
    console.log('downloaded')
  })
}, function(){}, true, 'America/Los_Angeles')

var job2 = new CronJob('* 20 * * * *', function() {
  var rs = fs.readFileSync(('./' + shop.filename));
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
          if(offer.model[0].indexOf('iPad') == -1 && offer.model[0].indexOf('LG') == -1 )
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
            desc: offer.description[0],
            categories: category_array,
          };
          //TODO: parse photos from site. Use cheerio
          //TODO: parse specs from site.
          //TODO:
          if(shop.name == 'Связной'){
            newItem.prg10 = true;
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
