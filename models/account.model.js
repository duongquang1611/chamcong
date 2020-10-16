// models/account.model.js
// load những thư viện chúng ta cần
var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");
// định nghĩ cấu trúc account model
var Schema = mongoose.Schema;
var schema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
schema.methods.encryptPassword = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};
schema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};
module.exports = mongoose.model("Account", schema);
