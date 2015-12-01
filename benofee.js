var xml2js_parseString = require('xml2js').parseString;
var exec = require('child_process').exec;
var getPictures = require('./html_parser.js').getPictures;
var async = require('async');
var fs = require('fs');
var mongoose = require('mongoose');
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
      default: Date.now
    },
    popularity: {
      type: Number,
      default: 0
    },
    prg6: {
      type: Boolean,
      default: false
    },
    prg10: {
      type: Boolean,
      default: false
    },
    prg12: {
      type: Boolean,
      default: false
    },
    prg24: {
      type: Boolean,
      default: false
    },
    prg36: {
      type: Boolean,
      default: false
    }
});

var job = new CronJob('20 * * * * *', function() {
  config.map(function(shop) {
    // console.log(shop)
    exec(('curl -X GET ' + shop.url + ' | iconv -f cp1251 -t utf8 -- > ' +  shop.filename), function(err, stdout, stderr) {
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
          // console.log(offer)
              var photos = [];
              var specs =[]
              getPictures(shop.name, offer.url[0], function(err, result){
                console.log(offer.url[0])
                if (result) {
                  photos = result.images;
                  specs = result.specs;
                var category_array = []
                offer.categoryId.map(function(id) {
                  category_array.push(categories[id])
                })
                var newItem = new Item({
                  title: offer.model[0],
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
                })
                //TODO: parse photos from site. Use cheerio
                //TODO: parse specs from site.
                //TODO:
                if(shop.name == 'Связной'){
                  newItem.prg10 = true;
                }

          Item.findOneAndUpdate({title: offer.model}, newItem, {upsert: true, new: true}, function (err, item) {
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
