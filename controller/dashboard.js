const CaC = require("../model/clusterAcademycoordinator");
const SchoolData = require("../model/udise/schooludiseData")
exports.cacList = async (req, res) => {
    try {
        const { page = 1, limit = 10, district, block, searchKey,cluster } = req.query;

        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.max(1, parseInt(limit, 10));

        let query = {};

        if (district) {
            query.Dist = district;
        }
        if (cluster) {
            query.cluster_name = cluster;
        }
        if (block) {
            query.Block = block;
        }

        if (searchKey) {
            query.$or = [
                { cac_mobile: { $regex: searchKey, $options: 'i' } }, 
                { c_name: { $regex: searchKey, $options: 'i' } }
            ];
        }
 
        const skip = (pageNum - 1) * limitNum;
        const totalCount = await CaC.countDocuments(query);

        if (totalCount === 0) {
            return res.status(200).json({
                success: false,
                message: 'No CAC found'
            });
        }

        const CacData = await CaC.find(query).skip(skip).limit(limitNum);
        const totalPages = Math.ceil(totalCount / limitNum);

        // Respond with the data
        return res.status(200).json({
            success: true,
            message:"Cac list",
            data:CacData,
            page,
            totalPages,
            currentPage: pageNum,
            totalCount
        });
    } catch (error) {
        // Handle any errors that occur
        console.error('Error fetching CAC list:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the CAC list.',
            error: error.message
        });
    }
};

exports.countData = async(req,res) => {
    try {
     
        const totalSchool = await SchoolData.find({sch_mgmt_id:1}).countDocuments();
        const totalCaC = await CaC.find({}).countDocuments();
        

        // Respond with the data
        return res.status(200).json({
            success: true,
            message:"Count list",
            data:{totalSchool,totalCaC}
        });
    } catch (error) {
        console.error('Error fetching CAC list:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the CAC list.',
            error: error.message
        });
    }
}

