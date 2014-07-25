
var stringTools = {}

/* check match */

var checkMatch_include = function(str, arr) {
	var count = 0
	for (var k in arr) {
		if (!arr.hasOwnProperty(k)) continue
		count += 1
		if (str.match(arr[k])) {
			return true
		}
	}
	return count === 0 ? true : false
}

var checkMatch_exclude = function(str, arr) {
	var count = 0
	for (var k in arr) {
		if (!arr.hasOwnProperty(k)) continue
		count += 1
		if (!str.match(arr[k])) {
			return true
		}
	}
	return false
}

var checkMatch_plain = function(str, keyword) {
	if (typeof keyword === "string") {
		keyword = [keyword]
	}
	
	for (var i = 0; i < keyword.length; i++) {
		if (str.match(keyword[i])) {
			return true
		}
	}
	return false
}

stringTools.checkMatch = function(str, kwDict) {
	// for kwDict == {string} || {array}
	if (!kwDict.include && !kwDict.exclude) {
		return checkMatch_plain(str, kwDict)
	} else {
		var include = kwDict.include || {},
			exclude = kwDict.exclude || {}

		if (checkMatch_include(str, include) && !checkMatch_exclude(str, exclude)) {
			return true
		} else {
			return false
		}
	}
}


module.exports = stringTools