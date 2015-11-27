var xml2js_parseString = require('xml2js').parseString;
var exec = require('child_process').exec;
var async = require('async');
var fs = require('fs');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/benofee');
var CronJob = require('cron').CronJob;
var config =
    [
      { name: 'Svyaznoy',
        url: 'http://feed.tools.mgcom.ru/o.cgi?source=svyaznoy_sankt-peterburg&filter_offers=svyaznoy_credit_0_0_10',
        url_prepend: 'http://static.svyaznoy.ru/',
        pictures_prepend_need: false,
        filename: 'svyaznoy.txt'
      },
      { name: 'Eldorado',
        url: '',
        url_prepend: '',
        pictures_prepend_need: false,
        filename: 'eldorado.txt'
      }
    ];

var Item = new Schema({
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
    action_ends: Date,
    popularity: Number,
    prg6: {
      type: Boolean,
      default: false
    },
    prg12: {
      type: Boolean,
      default: true
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
    exec(('curl -X GET ' + shop.url + ' | iconv -f cp1251 -t utf8 -- > ' +  shop.filename), function(err, stdout, stderr) {
      var rs = fs.readFileSync(('./' + shop.filename));
      xml2js_parseString(rs.toString(), function (err, result) {
        var categories = {};
        result.yml_catalog.shop[0].categories[0].category.map(function(item) {
            categories[item["$"].id] = item._
         });
        result.yml_catalog.shop[0].offers[0].offer.map(function(offer) {
          Item.findOne({title: offer.model}, function (err, item) {
            if (err)
              console.log('find', err);
            if (!item) {
              var category_array = []
              offer.categoryId.map(function(id) {
                category_array.push(categories[id])
              })
              var newItem = new Item({
                title: offer.model[0],
                index: offer['$'].id, 
                price: offer.price[0],
                shop: offer.url[0],
                cover: (offer.picture || {}), 
                vendor: offer.vendor[0], 
                desc: offer.description[0],
                categories: category_array,
              })
              //TODO: parse photos from site. Use cheerio
              //TODO: parse specs from site. 
              newItem.save(function (err) {
                if (err){
                  // console.log('saveitem', err)
                }
              })
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