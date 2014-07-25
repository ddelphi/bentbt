var options = {
	"decents": {

	},
	"distortion": {
		"insertion": {
			"targetExt": ".torrent",
			"newPathInsertion": "._new",
			"include": /\.torrent$/i,
			"exclude": /\._new\.torrent$/i,
			"fileAccessLimit": /\.torrent$/i
		},
		"hex": {
			
		}
	},
	"editor": {
		"auto": {
			"map": {
				"view": /.torrent$/i,
				"merge": /.torrent.edit$/i,
				"mergeAll": /^_all.torrent.edit$/i
			}
		},
		"view": {
			"ext": ".edit",
			"filterModel": {
				"piece": false,
				"pieces": false,
				"ed2k": false,
				"filehash": false
			},
			"fileAccessLimit": /\.torrent$/i
		},
		"viewAll": {
			"include": /\.torrent$/i,
			"exclude": /\._new\.torrent$/i
		},
		"merge": {
			"insertion": "._new",
			"ext": ".edit",
			"fileAccessLimit": /\.torrent(\.edit)?$/i
		},
		"mergeAll": {
			"ext": ".edit",
			"globalEditFile": "_all.torrent.edit",
			"include": /\.torrent$/i,
			"exclude": /\._new\.torrent$/i
		}
	},
	"consolex": {
		"canOutput": true
	}
}


module.exports = options