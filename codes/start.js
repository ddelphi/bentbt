
var consoleWindow = require("./lib/console")
var decents = require("./decents")
var prepareJSON = require("./lib/prepareJSON")

var consolePanel = consoleWindow.consolePanel
var consoleParams = consoleWindow.consoleParams



var main = {
	getConsoleArgs: function() {
		var args = consolePanel.getArgs()
		var obj = consoleParams.parse(args)

		this.convertValueToDict(obj)
		this.changeCwd(obj.path)
		return obj
	},
	changeCwd: function(path) {
		if (!path) { return }
		consolePanel.changeCwd(path)
	},
	convertValueToDict: function(obj) {
		var val
		for (var k in obj) {
			if (!obj.hasOwnProperty(k)) continue
			val = obj[k]
			if (prepareJSON.isDictString(val)) {
				try {
					val = prepareJSON.normalize(val)
					obj[k] = JSON.parse(val)
				} catch(e) {
					throw new Error("console arguments has error in converting value to dict.")
				}
			}
		}	
	},
	execute: function(params) {
		decents.execute(params)
	},
	start: function() {
		var obj = this.getConsoleArgs()
		this.execute(obj)
	}
}

main.start()