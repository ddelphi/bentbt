
var distortion = require("./distortion")
var editor = require("./editor")



/*
	decents object
	This is the main object for the whole project
	It acts as a container object
*/
var decents = {
	collection: {},
	
	add: function(name, obj) {
		if (typeof obj.execute !== "function") {
			throw new Error("decents error in adding object.")
		}
		if (typeof obj.init === "function") {
			obj.init()
		}
		this.collection[name] = obj
	},
	doAction: function(methodObj, params) {
		if (this.collection.hasOwnProperty(methodObj)) {
			this.collection[methodObj].execute(params)
		}
	},
	execute: function(params) {
		var method = params.method
		this.doAction(method, params)
	}
}



decents.add("distortion", distortion)
decents.add("editor", editor)
module.exports = decents
 