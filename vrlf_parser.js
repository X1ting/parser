var parseString = require('xml2js').parseString;
var exec = require('child_process').exec;
var async = require('async');
var fs = require('fs');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/parser');
var CronJob = require('cron').CronJob;
var config =
    [{ name: 'VRLF',
      url: 'http://vrlf.ru/exchange/get_export/4785/?as_file=0',
      url_prepend: 'http://vrlf.ru/',
      pictures_prepend_need: false,
      filename: 'vrlf.txt'
    }]
var Item = mongoose.model('Item',
  {
    title: String,
    cover: String,
    likes: {
      type: Number,
      default: 0
    },
    dislikes: {
      type: Number,
      default: 0
    },
    tags: [],
    desc: String,
    shops: [
      {
        name: String,
        price: Number,
        url: String,
        date: {
          type: String,
          default: Date.now()
        },

      }
    ],
    specs: [{
      name: String,
      value: String
    }],
    // vendor: String,
    category: [String],
    index: Number,
    photos: [String],
    offers: []
  });

var job = new CronJob('20 * * * * *', function() {
  config.map(function(shop) {
    exec(('curl -X GET ' + shop.url + ' | iconv -f cp1251 -t utf8 -- > ' +  shop.filename), function(err, stdout, stderr) {
      // console.log(stdout)
      var rs = fs.readFileSync(('./' + shop.filename));
      parseString(rs.toString(), function (err, result) {
        var categories = {};
        // console.log(result.yml_catalog.shop[0].categories[0].category);
        result.yml_catalog.shop[0].categories[0].category.map(function(item) {
            categories[item["$"].id] = item._
         });
        // console.log(categories)
        result.yml_catalog.shop[0].offers[0].offer.map(function(offer) {
          console.log(offer)
          Item.findOne({title: offer.name[0]}, function (err, item) {
            if (err)
              console.log('find', err);
            if (!item) {
              var category_array = []
              console.log('categories', categories)
              offer.categoryId.map(function(id) {
                category_array.push(categories[id])
              })
              var pictures = []
              var reg = /picture/
              Object.keys(offer).map((key) => {
                if (reg.test(key)){
                  pictures.push(offer[key])
                }
              })
              var desc = ""
              var characterstiscs = []
              if (offer.characteristics) {
                characterstiscs = offer.characteristics[0].split('<span').map((item) => { return ('<span'+ item).replace(/<(?:.|\n)*?>/gm, ' ').replace(/&nbsp;/gi,' ').replace(/(\r\n|\n|\r)/gm," ")}).map((item) => {if (item.split(':').length > 1) {return {name: item.split(':')[0].replace(/( )*/, ' '), value: item.split(':')[1].replace(/( )*/, ' ')}} else {return {name: '', value: item.split(':')[0].replace(/( )*/, ' ')}}})
              }
              if (offer.description) {
                desc = offer.description[0].replace(/<(?:.|\n)*?>/gm, '').replace(/(\r\n|\n|\r)/gm," ").replace(/&nbsp;/gi,' ')
              }
              new Item({
                title: offer.name[0],
                index: offer['$'].id,
                shops: [{ name: shop.name,
                          price: offer.price[0],
                          url: offer.url[0]
                        }],
                desc: desc,
                specs: characterstiscs,
                cover: (offer.picture || {}),
                category: category_array,
                photos: pictures
              }).save(function (err) {
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

