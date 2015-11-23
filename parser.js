var parseString = require('xml2js').parseString;
var exec = require('child_process').exec;
var async = require('async');
var fs = require('fs');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/parser');
var CronJob = require('cron').CronJob;
var config = [
    // { name: 'Madrobots',
    //   url: 'http://madrobots.ru/htcCatalogNew.xml',
    //   url_prepend: 'http://madrobots.ru/',
    //   pictures_prepend_need: true,
    //   filename: 'mrob.txt'
    // },
    // { name: 'Designboom',
    //   url: 'http://designboom.ru/bitrix/catalog_export/yml.php',
    //   url_prepend: 'http://designboom.ru/',
    //   pictures_prepend_need: false,
    //   filename: 'dboom.txt'
    // },
    { name: 'VRLF',
      url: 'http://vrlf.ru/',
      url_prepend: 'http://vrlf.ru/',
      pictures_prepend_need: false,
      filename: 'vrlf.txt'
    }
  ]
var Item = mongoose.model('Item',
  {
    title: String,
    cover: String,
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
    vendor: String,
    categories: Array,
    id: Number,
    photos: Array
  });

var job = new CronJob('30 2 * * * *', function() {
  config.map((shop) => {
    exec(('curl -X GET ' + shop.url + ' | iconv -f cp1251 -t utf8 -- > ' +  shop.filename), function(err, stdout, stderr) {
      // console.log(stdout)
      var rs = fs.readFileSync(('./' + shop.filename));
      parseString(rs.toString(), function (err, result) {
        var categories = {};
        result.yml_catalog.shop[0].categories[0].category.map((item) => {
            categories[item["$"].id] = item._
         });
        console.log(shop)
        result.yml_catalog.shop[0].offers[0].offer.map((offer) => {
          // console.log(offer)
          Item.findOne({title: offer.model}, function (err, item) {
            if (err)
              console.log('find', err);
            if (!item) {
              var category_array = []
              offer.categoryId.map((id) => {
                category_array.push(categories[id])
              })
              var pictures = []
              if ((offer.param[2] || {})._){
                offer.param[2]._.split(',').map((picture) => {
                  if (shop.pictures_prepend_need)
                    pictures.push(shop.url_prepend.concat(picture))
                  else
                    pictures.push(picture)
              })}
              pictures.push((offer.picture || {})[0])
              new Item({
                title: offer.model[0],
                id: offer['$'].id, 
                shops: [{ name: shop.name, 
                          price: offer.price[0], 
                          url: offer.url[0]
                        }],
                cover: (offer.picture || {}), 
                vendor: offer.vendor[0], 
                desc: offer.description[0],
                categories: category_array,
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
  false, /* Start the job right now */
  'America/Los_Angeles' /* Time zone of this job. */
);
