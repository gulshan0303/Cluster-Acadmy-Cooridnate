const mongoose = require('mongoose');

const cacDetailsSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    udise_dist_code: {
        type: Number,
        required: true
    },
    Dist: {
        type: String,
        required: true
    },
    udise_block_code: {
        type: Number,
        required: true
    },
    Block: {
        type: String,
        required: true
    },
    udise_cluster_code: {
       type: String, 
    },
    cluster_name: {
        type: String,
        required: true
    },
    c_name: {
        type: String,
        required: true
    },
    gender: {
        type: Number, 
        required: true
    },
    cac_mobile: {
        type: Number,
        required: true,
    },
    design: {
        type: String,
        required: true
    }
}, { timestamps: true }); 

module.exports = mongoose.model('culsterAcademyCoordinator', cacDetailsSchema);;

