
var child_process = require("child_process")
var _ = require("lodash")
var ui = require("./ui")
var decents = require("./decents")
var eventSystem = require("./lib/eventSystem")
var dictTools = require("./lib/dictTools")
var controller = ui.controller
var interface = ui.interface



var info = [
	{
		"content": "insertion",
		"command": "distortion_insertion.cmd %1"
	}, {
		"content": "insertion (directory)",
		"command": "distortion_insertion_directory.cmd %1"
	}, {
		"content": "hex",
		"command": "distortion_hex.cmd %1"
	}, {
		"content": "hex (directory)",
		"command": "distortion_hex_directory.cmd %1"
	}, {
		"content": "view",
		"command": "editor_view.cmd %1"
	}, {
		"content": "view (directory)",
		"command": "editor_viewAll.cmd %1"
	}, {
		"content": "merge",
		"command": "editor_merge.cmd %1"
	}, {
		"content": "merge (directory)",
		"command": "editor_mergeAll.cmd %1"
	}
]


var interfaceMain = {
	init: function() {
		this.initParams()
		this.initEvents()
	},
	initParams: function() {
		this.content = _.cloneDeep(info)
		this.target = info

		dictTools.filter(this.contnet, {"target": false})
	},
	initEvents: function() {
		eventSystem.register("decents", this.onDecentsIncome.bind(this))
	},
	constructCommand: function(cmd, arg) {
		var prefix = ""
		var fin = cmd.replace("%1", arg)
		return prefix + fin
	},
	onDecentsIncome: function(income) {
		var self = this,
			i = income.type,
			path = income.data.path

		var cmdStr = self.constructCommand(self.target[i].command, path)
		child_process.exec(cmdStr, function(err, stdout, stderr) {
			if (err) {
				console.info("[ERROR] ", self.normalOutputInfo(err))
			} else {
				console.info("[INFO] ", self.normalOutputInfo(stdout))
				if (stderr) {
					console.info("[ERROR] ", self.normalOutputInfo(stderr))
				}
			}
		})
	},
	normalOutputInfo: function(info) {
		var pattern = /nothing/i
		return info
	},
	start: function() {
		interface.start()
		controller.initContent(this.content)
	}
}

interfaceMain.init()
interfaceMain.start()

