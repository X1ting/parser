var mongoose = require('mongoose');

var Item = mongoose.Schema({
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
module.exports = mongoose.model('Item', Item);
