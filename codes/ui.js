
var _ = require("lodash")
var eventSystem = require("./lib/eventSystem")


var ui = {
	content: [],
	
	addItem: function(i, con) {
		var len = this.content.length
		if (typeof con === "undefined") {
			con = i
			i = len
		}
		this.content = [].concat(this.content.splice(0, i), con, this.content.splice(i, len))
	},
	removeItem: function(i) {
		if (!this.hasItem(i)) { return }
		var con = this.content
		this.content = [].concat(con.slice(0, i), con.slice(i+1, con.length))
	},
	getItem: function(i) {
		return this.hasItem(i) ? this.content[i] : false
	},
	hasItem: function(i) {
		return i > -1 && i < this.content.length
	},
	getLength: function() {
		return this.content.length
	},
	getStyle: function(i) {
		return this.content[i].style
	},
	setStyle: function(i, style) {
		if (!this.content[i]["style"]) {
			this.content[i]["style"] = {}
		}
		this.content[i]["style"] = _.extend(this.content[i]["style"], style)
	},
	update: function(drawer) {
		drawer.draw(this.content)
	}
}

var list = {
	init: function(options) {
		this.ui = options.ui
		this.drawer = options.drawer

		this.current = 0
		this.highlightStyle = {"color": "green"}
		this.normalStyle = {"color": "normal"}

	},
	add: function(val) {
		this.ui.addItem(val)
		this.highlight()
	},
	prev: function() {
		this.current = this.current === 0 ? 0 : this.current - 1
		this.highlight()
	},
	next: function() {
		this.current = this.current === this.ui.getLength() - 1 ? this.current : this.current + 1
		this.highlight()
	},
	highlight: function() {
		for (var i = 0; i < this.ui.getLength(); i++) {
			if (i === this.current) {
				this.ui.setStyle(i, this.highlightStyle)
			} else {
				this.ui.setStyle(i, this.normalStyle)
			}
		}
		this.ui.update(this.drawer)
		
		eventSystem.trigger("selection", {
			"data": this.current
		})
	}
	
}


var controller = {
	init: function(options) {
		options = options || {}
		this.ui = options.ui
		this.contentList = options.contentList

		this.selection = ""
		this.initEvents()
		this.initContent(options.contentList)
	},
	initEvents: function() {
		eventSystem.register("selection", this.select.bind(this))
		eventSystem.register("key", this.onKey.bind(this))
		eventSystem.register("key", this.onFileIncome.bind(this))
	},
	initContent: function(contentList) {
		if (!contentList) { return }
		var self = this
		contentList.forEach(function(val) {
			self.add(val)
		})
	},
	add: function(val) {
		this.ui.add(val)
	},

	/**/

	onKey: function(data) {
		var map = {
			"\u001b[A": "up",
			"\u001b[B": "down"
			// "\u001b[C": "right",
			// "\u001b[D": "left"
		}

		var num = data.which
		if (map[num]) {
			this.performKey(map[num])
		}
	},
	performKey: function(type) {
		var fn = "key_" + type
		if (this[fn]) {
			this[fn].call(this)
		}
	},
	key_up: function() {
		this.ui.prev()
	},
	key_down: function() {
		this.ui.next()
	},
	select: function(income) {
		this.selection = income.data
	},

	/**/

	onFileIncome: function(data) {
		var pattern = /^"?\w:([\\\/].+?)+"?/i,
			path = data.which
		if (pattern.test(path)) {
			this.performFileAction(path)
		}
	},
	performFileAction: function(path) {
		eventSystem.trigger("decents", {
			"type": this.selection,
			"data": {
				"path": path
			}
		})
	}
}



var colorMap = {
	"green": "\033[32m<s>\033[0m",
	"orange": "\033[31m<s>\033[0m",
	"blue": "\033[34m<s>\033[0m",
	"gray": "\033[5m<s>\033[0m",
	"brown": "\033[33m<s>\033[0m",
	"normal": "\033[0m<s>\033[0m"
}

/*
	interface object
	a drawer
*/
var interface = {
	content: null,

	init: function() {
		this.output = null
	},
	initEvents: function() {
		var stdin = process.stdin
		stdin.setRawMode(true)
		stdin.resume()
		stdin.setEncoding("utf8")

		stdin.on("data", function(key) {
			eventSystem.trigger("key", {
				"which": key
			})
		})
	},
	createInterface: function() {
		return process.stdout
	},
	applyStyle: function(content, style) {
		if (!style) { return }

		var res,
		colorPattern = colorMap[style.color]
		if (colorPattern) {
			res = colorPattern.replace("<s>", content)
		}
		return res
	},
	clear: function() {
		process.stdout.write("\033c")
	},
	draw: function(data) {
		this.content = data
		this.clear()

		var self = this,
			res = [],
			con,
			style
		data.forEach(function(val) {
			con = val.content
			style = val.style
			con = self.applyStyle(con, style)
			res.push(con)
		})
		res.push("\n")
		this.output.write(res.join("\n"))
	},
	start: function() {
		this.output = this.createInterface()
		this.initEvents()
	}
}

interface.init()
list.init({
	"ui": ui,
	"drawer": interface
})
controller.init({
	"ui": list
})



module.exports = {
	"ui": ui,
	"list": list,
	"controller": controller,
	"interface": interface
}