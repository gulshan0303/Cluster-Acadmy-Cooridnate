const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNo: {
        type: String,
        // required: true
    },
    token: {
        type: String,
    },
    gender: {
        type: String,
    },
    districtId: {
        type: String,
    },
    districtName: {
        type: String,
    },
    blockId: {
        type: String,
    },
    blockName: {
        type: String,
    },
    clusterId: {
        type: String,
    },
    clusterName: {
        type: String,
    },
    visitSchools:[{
        state:String,
        role:String,
        udise_code:String,
        confirm:Boolean,
        date:String,
        number:String
    }],
},{ timestamps: true });

module.exports = mongoose.model('User', userSchema);
