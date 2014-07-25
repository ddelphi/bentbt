
var btTools = require("./lib/btTools")
var distortionTools = require("./lib/distortionTools")
var fileTools = require("./lib/fileTools")
var accessController = require("./lib/accessController")
var options = require("./options").distortion.insertion



/*
	distortion object
	This is an object for disturbing the information of the torrent file
*/
var distortion = {
	distort: function(params) {
		var path = params.path
		var newPath = params.newPath
		
		console.info("\n\nStarting distortion's %s object...".replace("%s", params.option.method))
		console.info("\nDealing file:\n", params.path)
		var btObject = btTools.decodeFile(path)
		distortionTools.execute(params.option.method, {
			option: params.option,
			target: btObject
		})
		btTools.encodeFile(btObject, newPath)
		console.info("\nFile is saved at:\n", newPath)
	},

	/**/

	constructParams: function(params) {
		this.constructNewPath(params)
	},
	constructNewPath: function(params) {
		// construct new path
		var path = params.path
		var targetExt = options.targetExt
		var index = path.lastIndexOf(targetExt) || path.lastIndexOf(".")
		var newPath = path.slice(0, index) + options.newPathInsertion + path.slice(index)
		
		// check the validation of filename
		var pattern = /[<>"\*\|\?]+/ig
		if (newPath.match(pattern)) {
			throw new Error("newPath is not a valid path.")
		}

		params.newPath = newPath
	},
	
	/**/

	process: function(params) {
		accessController.checkFileType(params.path, options.fileAccessLimit)
		this.constructParams(params)
		this.distort(params)
	},
	execute: function(params) {
		if (typeof params.dir === "undefined") {
			this.process(params)
		} else {
			var self = this
			var loParams = {
				"path": params.path,
				"include": options.include,
				"exclude": options.exclude
			}
			fileTools.loopDir(loParams, function(i, filePath) {
				params.path = filePath
				self.process(params)
			})
		}
	}
}


module.exports = distortion