var mongoose = require('mongoose');

var Item = mongoose.Schema({
    title: {
        type: String,
        index: true
    },
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
    shopname: String,
    hide: {
        type: Boolean,
        default: false
    },
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
      type: Number,
      default: Date.now()
    },
    popularity: {
      type: Number,
      default: 0,
      index: true 
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
module.exports = mongoose.model('Item', Item);
