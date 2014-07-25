
var fs = require("fs")



var fileTools = {
	isFile: function(path) {
		try {
			var stat = fs.statSync(path)
			if (stat.isFile()) {
				return true
			}
		} catch(e) {
			// console.error("Error, no such file: %s".replace("%s", path))
			return false
		}
		return false
	},
	isDir: function(path) {
		try {
			var stat = fs.statSync(path)
			if (stat.isDirectory()) {
				return true
			}
		} catch(e) {
			// console.error("Error, no such directory: %s".replace("%s", path))
			return false
		}
		return false
	},
	loopDir: function(params, fn) {
		var dir = this.getDir(params.path)
		var files = fs.readdirSync(dir)
		this._includeFiles(files, params.include)
		this._excludeFiles(files, params.exclude)
		
		files.forEach(function(file, i, who) {
			if (typeof file === "undefined") { return }
			fn(i, file, who)
		})
	},
	getDir: function(path) {
		var dir = path
		var res = this._isFileOrDir(path)
		if (!res) { 
			throw new Error("path is not a valid path.")
		}

		if (res === "file") {
			dir = path.replace(/[\/\\][^\/\\]+$/, "")
		}
		return dir
	},
	_isFileOrDir: function(path) {
		try {
			var res
			var stat = fs.statSync(path)
			if (stat.isDirectory()) {
				res = "dir"
			} else if (stat.isFile()) {
				res = "file"
			}
			return res
		} catch(e) {
			throw new Error("Error, no such file or directory: %s".replace("%s", path))
			return false
		}
	},
	_includeFiles: function(files, keyword) {
		if (!keyword) { return }
		files.forEach(function(val, k, who) {
			if (!val.match(keyword)) {
				delete who[k]
			}
		})
	},
	_excludeFiles: function(files, keyword) {
		if (!keyword) { return }
		files.forEach(function(val, k, who) {
			if (val.match(keyword)) {
				delete who[k]
			}
		})
	}
}


module.exports = fileTools