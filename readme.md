
# readme

## overview

This is a nodejs script for changing some information text of the bt torrent file. There are two ways to change the infomation, one is using the insertion method to auto change the infomation specified by yourself, the other one is to change the infomation manually.

The code is only tested in windows XP, not tested in other operation system.

## prerequisite

You should have the Node.js installed.

And, you should run the install.cmd command file which in the codes folder, to install the required libraries.

## using GUI

There is an `interface.cmd` file under the root of the script folder. That is the simple GUI for quick using the functions of the script.

After opened the `interface.cmd` file, there are a list of text item displayed on the console window, which are corresponding to the methods described below. You can use the `↑` and `↓` key to choose one item, then drag a file (or folder) to the console window to execute the corresponding method.

## usage - distortion

#### simple usage

For distorting the informations of the torrent file, you should follow the instructions below.

There are two ways to use the script:

	* single file conversion
	* multi files conversion (in a directory)

Single file conversion can be executed by:

	distortion_insertion.cmd
	distortion_hex.cmd

Multi files conversion can be executed by:
	
	distortion_insertion_directory.cmd
	distortion_hex_directory.cmd

You can drag the torrent file to the executable `cmd` file, to execute the method.

The insertion method will insert a word between every character. The hex method will convert the information text into utf8 hex format.

#### advanced usage

Frist, let's look at the command in the `distortion_insertion.cmd` file:

	node start.js -method distortion -option "{method:'insertion', every: 1, insWord: '`', keyword:{include:['path', 'info.name', 'publisher']}}" -path %1

The important thing that you should be noticed is the "-option" part.

There are 4 key-value pairs of the "-option" part, those are:
	
	method: 'insertion',
	every: 1,
	insWord: '`',
	keyword: {include:['path', 'info.name', 'publisher']}

The `method` part means the distortion method. insertion method will 

The `every` part means the insertion word will be inserted in the information by every N's character.

The `insWord` part means the insertion word that you want.

The `keyword` part means that what parts of information in torrent file you want to change. You should treat the value of those strings as the string from of regular expression. For example `info.name` means that we want to change the info.name part of the infomation.

You can use the "include" form or "exclude" form or both in the `keyword` part. Leave out the "include" form will include all by default, and leave out the "exclude" form will exclude none by default.


## usage - editing

There are 4 cmd files under the root of the script folder:
	
	# editor_view.cmd
	# editor_viewAll.cmd
	# editor_edit.cmd
	# editor_editAll.cmd

To use it, you can drag a torrent file to the `editor_view.cmd` file to perform the action, and you can drag a folder or a file in the folder to the `editor_viewAll.cmd` file to apply the action for all the torrent files.

The same usage for the `edit` version, and it can accept torrent file and the file with `.torrent.edit` extension.

The `view` cmd file will create an editable text file (`.torrent.edit`) in yaml markup language in the same folder. You can modify the information, or adding information with the correct structure by the torrent specification.

The `viewAll` cmd file can access all the torrent files in the folder, and perform the action just like the 'view' cmd file.

The `edit` cmd file will parse the editable text file, then merge it and the corresponding torrent file into a new torrent file.

The `editAll` cmd file can access all the torrent files and the corresponding editable text files in the folder, and perform the action just like the 'edit' cmd file. One more special thing is that, you can create a `_all.torrent.edit` file, and write some information with correct structure in it, then the `editAll` cmd will take it into account when performing the merging action.

A simple description:

	drag a.torrent to `editor_view.cmd`
		↓
	a.torrent.edit
	
	drag a.torrent to `editor_view.cmd`
		↓
	a.torrent.edit
	b.torrent.edit
	...
	
	// after modified the torrent.edit file
	
	drag a.torrent.edit (or a.torrent) to `editor_edit.cmd`
		↓
		↓ (merge a.torrent.edit and a.torrent)
		↓
	a._new.torrent

	drag a.torrent.edit to `editor_editAll.cmd`
		↓
		↓ (merge _all.torrent.edit (optional), a.torrent.edit and a.torrent)
		↓ ...
		↓
	a._new.torrent
	b._new.torrent
	...

## notice

[ONE]

Because some keys of the torrent file are the important data to the torrent file, so the script will leave it out of the editable file.

These keys are:

	pieces
	piece length
	ed2k
	filehash

[TWO]

Some torrent file's path name are not the utf8 encoding, so the path may not be display correctly.

This situation will always happen when there are two path keys under the same slot. The two path keys are `path` and `path.utf8`, so the `path.utf8` will be display correctly.
