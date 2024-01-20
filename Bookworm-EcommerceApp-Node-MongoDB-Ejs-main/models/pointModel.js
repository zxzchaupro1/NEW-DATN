const mongoose = require('mongoose');
const Scheme = mongoose.Schema
const pointScheme = new Scheme({    
    user : {
        type : mongoose.SchemaTypes.ObjectId,
        ref : 'user'
    },
    book : {
        type : mongoose.SchemaTypes.ObjectId,
        ref : 'book'
    },
    isRead : {
        type : Number,
        default : 1
    }, 
});

const point = mongoose.model('point', pointScheme);

module.exports = point;