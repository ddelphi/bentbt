
var fs = require("fs")
var _ = require("lodash")
var yaml = require("js-yaml")
var btTools = require("./lib/btTools")
var fileTools = require("./lib/fileTools")
var dictTools = require("./lib/dictTools")
var accessController = require("./lib/accessController")
var options = require("./options")


/*
	editor object
	For editing the information of the torrent file
*/
var editor = {
	collection: {},
	
	add: function(name, obj) {
		if (typeof obj.execute !== "function") {
			throw new Error("Error in adding object.")
		}
		if (typeof obj.init === "function") {
			obj.init()
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
	doAction: function(name, params, core) {
		if (this.collection.hasOwnProperty(name)) {
			this.collection[name].execute(params, core)
		}
	},
	getModule: function(name) {
		var obj = this.collection[name]
		return obj ? obj : null
	},
	execute: function(params) {
		var method = params.option.method
		this.doAction(method, params, this)
	}
}


// @deprecated (?)
editor.add("auto", {
	auto: function(params, core) {
		console.info("\n\nStarting auto execution object...")
		var type = this.judgeType(params)
		this.executeType(type, params, core)
	},
	// judge the type of file for starting corresponding action
	judgeType: function(params) {
		var map = options.editor.auto.map
		for (var k in map) {
			if (!map.hasOwnProperty(k)) continue
			if (this.judgeTypeByPath(map[k], params)) {
				return k
			}
		}
	},
	judgeTypeByPath: function(pattern, params) {
		var path = params.path
		return pattern.test(path)
	},
	executeType: function(type, params, core) {
		var mod = core.getModule(type)
		if (mod) {
			mod.execute(params)
		}
	},
	execute: function(params, core) {
		this.auto(params, core)
	}
})

editor.add("view", {
	view: function(params) {
		var res,
			newPath

		console.info("\n\nStarting view object...")
		console.info("\nDealing file:\n", params.path)
		res = this.read(params.path)
		res = this.filter(res)
		newPath = this.constructFilename(params)
		this.write(newPath, res)
		console.info("\nFile is saved at:\n", newPath)
	},
	read: function(path) {
		var obj = btTools.decodeFile(path)
		return obj
	},
	filter: function(dict) {
		var filterModel = options.editor.view.filterModel
		dictTools.filter(dict, filterModel)
		return dict
	},
	constructFilename: function(params) {
		var newPath = params.path + options.editor.view.ext
		return newPath
	},
	write: function(path, obj) {
		var yamlObj = yaml.safeDump(obj)
		fs.writeFileSync(path, yamlObj, {"encoding": "utf8"})
	},
	execute: function(params) {
		accessController.checkFileType(params.path, options.editor.view.fileAccessLimit)
		this.view(params)
	}
})

editor.add("viewAll", {
	viewAll: function(params, core) {
		console.info("\n\nStarting viewAll object...")
		this.viewObject = core.getModule("view")
		this.loopView(params.path)
	},
	loopView: function(dir) {
		var params = {
			"path": dir,
			"include": options.editor.viewAll.include,
			"exclude": options.editor.viewAll.exclude
		}
		fileTools.loopDir(params, this.viewIt.bind(this))
	},
	viewIt: function(index, path) {
		var params = {
			"path": path
		}
		this.viewObject.execute(params)
	},
	execute: function(params, core) {
		this.viewAll(params, core)
	}
})




editor.add("merge", {
	merge: function(params) {
		var res,
			newPath

		console.info("\n\nStarting merge object...")
		console.info("\nDealing file:\n", params.path)
		res = this.read(params)
		res = this.combine(res)
		newPath = this.constructFilename(params)
		this.write(res, newPath)
		console.info("\nNew torrent file will be saved at:\n", newPath)
	},

	/**/

	read: function(params) {
		var res = [],
			path = params.path,
			otherTargets = params.option ? params.option.files : null			
		
		var torrentEditPath
		if (!otherTargets || otherTargets.length === 0) {
			torrentEditPath = this.createTorrentEditPath(path)
			otherTargets = [torrentEditPath]
		}
		var torrent = this.readTorrent(path)
		var editFiles = this.readEditFiles(otherTargets)
		res = _.union(res, [torrent], editFiles)
		return res
	},
	readEditFiles: function(/*...*/) {
		var self = this,
			args = Array.prototype.slice.call(arguments)
		
		var content,
			res = []
		args.forEach(function(paths) {
			if (!_.isArray(paths)) {
				paths = [paths]
			}
			paths.forEach(function(path) {
				if (!fileTools.isFile(path)) {
					console.info("[INFO] missing file %1".replace("%1", path))
					return
				}
				content = fs.readFileSync(path, "utf8")
				res.push(yaml.safeLoad(content))
			})
		})
		return res
	},
	createTorrentEditPath: function(path) {
		var newPath = this.normalTorrentPath(path)
		newPath += options.editor.merge.ext
		return newPath
	},
	readTorrent: function(path) {
		var newPath = this.normalTorrentPath(path)
		return btTools.decodeFile(newPath)
	},
	normalTorrentPath: function(path) {
		var torrent = /\.torrent.*$/ig
		return path.replace(torrent, ".torrent")
	},

	/**/

	combine: function(fileList) {
		var res = fileList[0]
		for (var i = 1; i < fileList.length; i++) {
			_.merge(res, fileList[i])
		}
		return res
	},
	constructFilename: function(params) {
		var newPath = this.normalTorrentPath(params.path)
		var ins = options.editor.merge.insertion
		var torrent = ".torrent"
		newPath = newPath.replace(torrent, ins + torrent)
		return newPath
	},

	/**/

	write: function(obj, path) {
		btTools.encodeFile(obj, path)
	},
	execute: function(params) {
		accessController.checkFileType(params.path, options.editor.merge.fileAccessLimit)
		this.merge(params)
	}
})

editor.add("mergeAll", {
	mergeAll: function(params, core) {
		console.info("\n\nStarting mergeAll object...")
		this.editObject = core.getModule("merge")

		this.loopEdit(params.path)
	},
	loopEdit: function(dir) {
		var params = {
			"path": dir,
			"include": options.editor.mergeAll.include,
			"exclude": options.editor.mergeAll.exclude
		}
		fileTools.loopDir(params, this.editIt.bind(this))
	},
	editIt: function(index, path) {
		var params = {
			"path": path,
			"option": {
				"files": [
					this.constructEditPath(path),
					options.editor.mergeAll.globalEditFile
				]
			}
		}
		this.editObject.execute(params)
	},
	constructEditPath: function(path) {
		var pattern = /\.torrent.*$/ig,
			torrent = ".torrent",
			ext = options.editor.mergeAll.ext
		return path.replace(pattern, torrent + ext)
	},
	execute: function(params, core) {
		this.mergeAll(params, core)
	}
})

module.exports = editor