const mongoose = require('mongoose');
const { Types: { Long } } = mongoose;


const schoolUdiseDataSchema = new mongoose.Schema({
  district_name: String,
  block_name: String,
  udise_sch_code: Number,
  school_name: String,
  sch_category_id: Number,
  sch_category_id_desc: String,
  sch_mgmt_id: Number,
  sch_mgmt_id_desc: String,
  sch_type: Number,
  sch_type_desc: String,
  bld_status: String,
  clsrms_inst: Number,
  clsrms_pre_pri: Number,
  clsrms_pri: Number,
  clsrms_upr: Number,
  clsrms_sec: Number,
  clsrms_hsec: Number,
  clsrms_not_inst: Number,
  clsrms_und_cons: Number,
  othrooms: Number,
  all_cls_room: Number,
  no_of_boys_toilet_funcational: Number,
  no_of_girls_toilet_funcational: Number,
  cwsn_toilet: String,
  drink_water_yn_func: String,
  electricity_yn: String,
  clsrms_min: Number,
  clsrms_min_ppu: Number,
  clsrms_min_kun: Number,
  clsrms_min_tnt: Number,
  clsrms_maj: Number,
  clsrms_maj_ppu: Number,
  clsrms_maj_kuc: Number,
  clsrms_maj_tnt: Number,
  ramps_yn: String,
  land_avl_yn: String,
  handrails_yn: String,
  library_room_yn: String,
  craft_room_yn: String,
  tinkering_lab_yn: String,
  sanitary_yn: String,
  incinerator_yn: String,
  integrated_sci_lab_yn: String,
  comp_lab_yn: String,
  internet_available: String,
  anganbadi_same_campus: String,
  anganbadi_students: Number,
  no_of_academic_inspection: Number,
  no_of_crc_visit: Number,
  no_of_brc_beo_visit: Number,
  no_of_district_state_visit: Number,
  no_of_smc_smdc_meetings: Number,
  ict_lab_available: String,
  ict_lab_functional: String,
  smart_class_available: String,
  smart_class_functional: String,
  no_of_tch_non_teaching_assg: Number,
  tch_trnd_comp_teach: Number,
  tch_trnd_cwsn_teach: Number,
  no_of_principal: Number,
  no_of_headmaster: Number,
  total_teachers: Number,
  school_doing_peer_learning: String,
  district_cd: Number,
  block_cd: Number,
  cluster_cd: Number, // Using mongoose-long to handle long integers
  cluster_name: String,
  assembly_cons_cd: Number,
  assembly_name: String,
  sch_loc_r_u: Number,
  sch_location_desc: String,
  hm_mobile: Number, // Using mongoose-long to handle long integers
  "PP3(Boys)": Number,
  "PP3(Girls)": Number,
  "PP2(Boys)": Number,
  "PP2(Girls)": Number,
  "PP1(Boys)": Number,
  "PP1(Girls)": Number,
  "Class 1(Boys)": Number,
  "Class 1(Girls)": Number,
  "Class 2(Boys)": Number,
  "Class 2(Girls)": Number,
  "Class 3(Boys)": Number,
  "Class 3(Girls)": Number,
  "Class 4(Boys)": Number,
  "Class 4(Girls)": Number,
  "Class 5(Boys)": Number,
  "Class 5(Girls)": Number,
  "Class 6(Boys)": Number,
  "Class 6(Girls)": Number,
  "Class 7(Boys)": Number,
  "Class 7(Girls)": Number,
  "Class 8(Boys)": Number,
  "Class 8(Girls)": Number,
  "Class 9(Boys)": Number,
  "Class 9(Girls)": Number,
  "Class 10(Boys)": Number,
  "Class 10(Girls)": Number,
  "Class 11(Boys)": Number,
  "Class 11(Girls)": Number,
  "Class 12(Boys)": Number,
  "Class 12(Girls)": Number,
  Total_enr: Number,
  PTR: Number,
  SCR: Number});


module.exports = mongoose.model('schooludiseData', schoolUdiseDataSchema);

