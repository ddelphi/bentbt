
var _ = require("lodash")
var dictTools = require("./dictTools")
var stringTools = require("./stringTools")


/*
	distortionTools object
	This is a container object for executing action added to it
*/
var distortionTools = {
	collection: {},

	add: function(name, obj) {
		if (typeof obj.execute !== "function") {
			throw new Error("Error in add(): object should have an execute() method.")
		}
		this.collection[name] = obj
	},
	remove: function(name) {
		if (this.collection[name]) {
			delete this.collection[name]
			return true
		}
		return false
	},
	execute: function(actionName, data) {
		if (!this.collection[actionName]) { return false }
		this.collection[actionName].execute(data)
		return true
	}
}


/*
	insertion object
	This is an object for inserting characters into the information of the torrent file
*/
distortionTools.add("insertion", {
	default: {
		"ext": false,
		"every": 1,
		"insWord": "_",
		"keyword": {
			"include": ["info.name", "path"]
		}
	},
	setup: function(params) {
		this.target = params.target
		this.option = params.option
		this.option = _.extend({}, this.default, this.option)
	},

	/**/

	insertion: function(params) {
		this.setup(params)
		dictTools.each2(true, this.target, this.insertAction.bind(this))
	},
	insertAction: function(k, val, who, keyList) {
		var keywordDict = this.option.keyword,
			insWord = this.option.insWord,
			every = this.option.every

		var isMatch = this.checkMatch(keyList, keywordDict)
		
		if (isMatch && _.isString(val)) {
			who[k] = this.applyRule(val, every, insWord)
		}
	},
	checkMatch: function(keyList, kwDict) {
			var keyListStr = keyList.join(".")
			return stringTools.checkMatch(keyListStr, kwDict)
	},
	// insert action
	applyRule: function(str, every, insWord) {
		every = parseInt(every)
		every = every > 0 ? every : 1
		
		var len = this.dealExt(str),
			res = []
		for (var i = 0; i < len; i++) {
			if ((i + 1) % every === 0) {
				res.push(str[i], insWord)
			} else {
				res.push(str[i])
			}
		}
		res.push(str.slice(len))
		return res.join("")
	},
	// deal the ext
	dealExt: function(str) {
		var len = -1
		if (!this.option.ext) {
			len = str.lastIndexOf(".")
		}
		len = len > -1 ? len : str.length
		return len
	},
	execute: function(params) {
		this.insertion(params)
	}
})



distortionTools.add("hex", {
	default: {
		"ext": false,
		"keyword": {
			"include": ["info.name", "path"]
		}
	},
	setup: function(params) {
		this.target = params.target
		this.option = params.option
		this.option = _.extend({}, this.default, this.option)
	},

	/**/

	hexify: function(params) {
		this.setup(params)
		dictTools.each2(true, params.target, this.hexAction.bind(this))
	},
	hexAction: function(k, val, who, keyList) {
		var match = this.checkMatch(keyList, this.option.keyword)
		if (match && typeof val === "string") {
			who[k] = this.convertToHex(val)
		}
	},
	checkMatch: function(keyList, keywordDict) {
		var keyStr = keyList.join(".")
		return stringTools.checkMatch(keyStr, keywordDict)
	},
	convertToHex: function(str) {
		var i = this.dealExt(str),
			pre = str.substring(0, i),
			suf = str.substring(i, str.length)
		
		var perBuf = new Buffer(pre, "utf8"),
			preHex = perBuf.toString("hex")
		return preHex + suf
	},
	// deal the ext
	dealExt: function(str) {
		var len = -1
		if (!this.option.ext) {
			len = str.lastIndexOf(".")
		}
		len = len > -1 ? len : str.length
		return len
	},
	execute: function(params) {
		this.hexify(params)
	}
})

module.exports = distortionTools
