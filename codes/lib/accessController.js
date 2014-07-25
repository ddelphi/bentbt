
/*
	accessController object
	to make some limitation for some situation
*/
var accessController = {
	checkFileType: function(path, pattern, errMsg) {
		if (pattern.test(path)) {
			return true
		} else {
			errMsg = errMsg ? errMsg : "file is not recognized."
			console.error("assess denined:", errMsg)
			this.stop()
		}
	},
	stop: function() {
		 process.exit(1)
	}
}

module.exports = accessController