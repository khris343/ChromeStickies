
function newNote()
{
	console.log("Adding note")
    var newnote = new Note();
    var date = new Date();
    newnote.timestamp = date.getTime();
    newnote.lastModified.textContent = modifiedString(date);
    newnote.note.style.left = (Math.round(Math.random() * (window.innerWidth - 100)) + window.pageXOffset) + 'px';
    newnote.note.style.top = (Math.round(Math.random() * (window.innerHeight - 100)) + window.pageXOffset) + 'px';
	notes[newnote.timestamp] = newnote;
	save();
	newnote.editField.focus();
}

function save()
{
	var data = {};

	for (var row in notes) {
		var current = {};
		current.text = notes[row].editField.innerHTML;
		current.timestamp = notes[row].timestamp;
		current.left = notes[row].note.style.left;
		current.top = notes[row].note.style.top;
		data[current.timestamp] = current;
	}

	console.log("save")
	console.log(data)
	var obj = {};
	obj[url + "_stickies"] = data;

	chrome.storage.local.set(obj)

}

function foo () {
	var div=document.createElement("div");
	document.body.appendChild(div);
	div.innerText="test123";
}

var captured = null;
var notes = {};
var url = "";

function Note()
{
    var self = this;

    var note = document.createElement('div');
    var textBox = document.createElement('div');
    var deleteButton = document.createElement('div');
    var timestamp = document.createElement('div');

    note.className = 'chrome-sticky';
    note.style.zIndex = "10000000";
    note.addEventListener('mousedown', function(e) {
    	return self.onMouseDown(e);
    }, false);
    note.addEventListener('click', function() { 
    	return self.onNoteClick();
    }, false);
    this.note = note;


    deleteButton.style.zIndex = "10000001";
    deleteButton.className = 'delete-button';
    deleteButton.innerText="Delete";
    deleteButton.addEventListener('click', function(event) {
    	return self.deleteButton(event);
    }, false);
    note.appendChild(deleteButton);


    textBox.className = 'text-rect';
    textBox.setAttribute('contenteditable', true);
    textBox.addEventListener('keyup', function() {
    	return self.onKeyUp();
    }, false);
    note.appendChild(textBox);
    this.editField = textBox;


    timestamp.className = 'datestring';
    timestamp.addEventListener('mousedown', function(e) {
    	var deletedNote = this;
       
		delete notes[deletedNote.timestamp];
		save();

        var self = this;
        document.body.removeChild(self.note)

    }, false);
    note.appendChild(timestamp);
    this.lastModified = timestamp;

    document.body.appendChild(note);
    return this;
}


// Used code from http://jsfiddle.net/NMcuy/38/embedded/
Note.prototype = {

    deleteButton: function(event)
    {

        var note = this;
       
		delete notes[note.timestamp];
		save();

        var self = this;
        document.body.removeChild(self.note)
    },

    onMouseMove: function(e)
    {
        if (this != captured) {
            return;
        }

        this.note.style.left = e.clientX - this.startX + 'px';
        this.note.style.top = e.clientY - this.startY + 'px';
    },

    onMouseDown: function(e)
    {
        captured = this;
        this.startX = e.clientX - this.note.offsetLeft;
        this.startY = e.clientY - this.note.offsetTop;

        var self = this;
        this.mouseMove = function(e) {
        	return self.onMouseMove(e)
        }
        this.mouseUp = function(e) {
        	return self.onMouseUp(e)
        }

        document.addEventListener('mousemove', this.mouseMove, true);
        document.addEventListener('mouseup', this.mouseUp, true);

        return false;
    },

    onMouseUp: function(e)
    {
        document.removeEventListener('mousemove', this.mouseMove, true);
        document.removeEventListener('mouseup', this.mouseUp, true);

        save();
        return false;
    },

    onNoteClick: function(e)
    {
        this.editField.focus();
        getSelection().collapseToEnd();
    },

    onKeyUp: function()
    {
        save();
    }
}


function loadNotes(data) {
	url = data;
	chrome.storage.local.get(url + "_stickies", function (results) {
		console.log("load")
		console.log(url);
		console.log(results)
		if ((results == undefined) || (results[url + "_stickies"] == undefined)) {
			console.log("Cannot load results")
		} else {
			var oldNotes = results[url + "_stickies"];
			for (var row in oldNotes) {
				var newnote = new Note();
				newnote.editField.innerHTML = oldNotes[row].text;
				newnote.timestamp = oldNotes[row].timestamp;
				var date = new Date(newnote.timestamp)
				newnote.lastModified.textContent = modifiedString(date);
				newnote.note.style.left = oldNotes[row].left;
				newnote.note.style.top = oldNotes[row].top;
				notes[newnote.timestamp] = newnote;
			}
		}
	})

}

function modifiedString(date)
{
	
    return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
}


loadNotes(document.URL);