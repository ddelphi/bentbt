
var prepareJSON = {
	normalize: function(str) {
		if (!this.isDictString(str)) {
			throw new Error("prepareJSON error in normalize().")
		}
		str = this._normalizeQuote(str)
		str = this._constructKey(str)
		return str
	},
	isDictString: function(str) {
		var pattern = /^\{.+\}$/
		if (str.match(pattern)) {
			return true
		}
		return false
	},
	_normalizeQuote: function(str) {
		var pattern = /'/ig,
			replacement = "\""
		str = str.replace(pattern, replacement)
		return str
	},
	_constructKey: function(str) {
		var pattern = /([\w_$]+)\s*(?=:)/ig
		str = str.replace(pattern, function(who, p1) {
			return "\"%s\"".replace("%s", p1)
		})
		return str
	}
}


module.exports = prepareJSON