
var fs = require("fs")
var _ = require("lodash")
var bencode = require("./bencode")
var dictTools = require("./dictTools")



var settings = {
	"binaryKeys": [
		/piece/,
		/ed2k/,
		/filehash/
	],
	"autoStringConvertion": true,
	"filter": {}
}

var btTools = {
	decodeFile: function(path, options) {
		options = _.extend({}, settings, options)

		var res = this._decodeFile(path)
		res = this._stringConvertion("utf8", res, options.autoStringConvertion)
		this._filter(res, options)
		return res
	},
	encodeFile: function(object, path, options) {
		options = _.extend({}, settings, options)

		object = this._stringConvertion("binary", object, options.autoStringConvertion)
		this._encodeFile(object, path)
		return object
	},
	magnetToTorrent: function(mag) {
		// todo
	},
	torrentToMagnet: function(path) {
		// todo
	},
	convertStringTo: function(str, type) {
		var buf,
			res = null
		if (type === "utf8") {
			buf = new Buffer(str, "ascii")
			res = buf.toString("utf8")
		}
		else if (type === "binary") {
			buf = new Buffer(str, "utf8")
			res = buf.toString("binary")
		}
		return res
	},
	isBinaryKey: function(key) {
		var res = false
		settings.binaryKeys.forEach(function(pat) {
			if (pat.test(key)) {
				res = true
			}
		})
		return res
	},

	/**/

	_decodeFile: function(path) {
		var bin = fs.readFileSync(path, {"encoding": "binary"})
		return bencode.decode(bin)
	},
	_encodeFile: function(object, path) {
		var res = bencode.encode(object)
		fs.writeFileSync(path, res, {"encoding": "binary"})
		return res
	},
	_stringConvertion: function(type, obj, flag) {
		if (!flag) { return }
		var self = this,
			keyListStr
		dictTools.each2(true, obj, function(k, val, who, arr) {
			keyListStr = arr.join(".")
			if (!self.isBinaryKey(k) && _.isString(val)) {
				who[k] = self.convertStringTo(val, type)
			}
		})
		return obj
	},
	_filter: function(obj, options) {
		// filter to delete (modify)
		// or filter to iteration?
	}
}

module.exports = btTools