
function LoadNotes(result) {
	getCurrentTabUrl(function (url) {
		console.log(url)
		if ((result == undefined) || (result[url] == undefined)) {
			notes = []
			AddNote()
		}
		else {
			notes = result[url];
			if(notes.length == 0) {
				AddNote()
			}
			else {

				var toDelete = [];
				var noteReached = false;
				for (i=0; i<notes.length; i++) {
					var date = new Date(notes[i]['date'])
					var text = notes[i]['contents']
					if (text != '') {
					    var individual_note = $('<li note-id="' + notes[i]['id'] + '" class="note"><div class="note-text">' + notes[i]['contents'] + '</div><div class="date">' + modifiedString(date) + '</div></li>')
					   	if(!noteReached) {
					   		// just call the other function
					    	individual_note.addClass('active')
					    	$('#edit-note').val(notes[i]['contents'])
					    	$('#edit-note').attr('note-id', notes[i]['id'])
							var strDateTime = modifiedString(date);
							$('#header-time').text(strDateTime)
							noteReached = true;
					    }
					    
					    $('#notes-list').append(individual_note)
						$('.note').click(function() {
							SelectNote($(this).attr('note-id'))
						})
					}
					else {
						toDelete.push(i)
					}
				}
				for(i=0; i<toDelete.length; i++) {
					notes.splice(i, 1);
				}
				getCurrentTabUrl(function (url) {
					var obj = {};
					obj['total'] = total;
					obj[url] = notes;
					console.log(obj)
					chrome.storage.local.set(obj)
				})	
			}
		}
	})
}

function SelectNote(id, is_new) {
	$('.active').removeClass('active-alt');
	$('.active').removeClass('active');
	$('[note-id="' + id + '"]').addClass('active');
	$('#edit-note').attr('note-id', id);
	if (typeof is_new === 'undefined') {
		var result = $.grep(notes, function(e){ return e.id == id; })[0];
		var text = '';
		var date;
		if (result !== undefined) {
			text = result['contents'];
			date = new Date(result['date']);
		} else  {
			date = new Date();
		}
		$('#edit-note').val(text);
		var strDateTime = modifiedString(date)
	}
	else {
		$('#edit-note').val('');
		var date = new Date();
		var strDateTime = modifiedString(date)
	}
	$('#header-time').text(strDateTime);
}

var notes;
var stickies;
var total;

function SaveNote() {
	var text = $('#edit-note').val()
	var id = $('#edit-note').attr('note-id')

	index = _.findIndex(notes, function(e) { return e.id == id })
	if(index == -1) {index == 0}

	var date = new Date();
	if (notes[index] === undefined) {
		notes.push({'id':total, 'date': String(date), 'contents':text})
	}
	else {
		notes[index]['contents'] = text
		notes[index]['date'] = String(date);
	}
	getCurrentTabUrl(function (url) {
		console.log(url);
		var obj = {};
		obj['total'] = total;
		obj[url] = notes;
		console.log(obj)
		chrome.storage.local.set(obj, function () {
			// updating front end
			var date = new Date();
			$('#header-time').text(modifiedString(date))
			$('#notes-list').prepend($('#notes-list').find('[note-id="' + id + '"]'));
			$('#notes-list').find('[note-id="' + id + '"]').find('.date').text(modifiedString(date))	
			if(text != '') {
				$('#notes-list').find('[note-id="' + id + '"]').find('.note-text').text(text)
			}
			else {
				$('#notes-list').find('[note-id="' + id + '"]').find('.note-text').text('New Note')
			}
		})
	})
}

function AddSticky() {
	chrome.tabs.executeScript(null, {code: 'newNote()'});
}

function AddNote() {
	getCurrentTabUrl(function (url) {
		if ($('.note').first().find('.note-text').text() != "New Note") {
			total++;
			var date = new Date();
			var new_note = $('<li note-id="' + total + '" class="note"><div class="note-text">' + 'New Note' + '</div><div class="date">' + modifiedString(date) + '</div></li>')
			$('#notes-list').prepend(new_note)
			new_note.click(function() {
				SelectNote($(this).attr('note-id'))
			})
			SelectNote(total, true)
		}	

	})
}

function DeleteNote(id) {
	if ($('.note.active').find('.note-text').text() != "New Note") {
		// deleting in backend
		index = _.findIndex(notes, function(e) { return e.id == id })
		notes.splice(index, 1)
		getCurrentTabUrl(function (url) {
			var obj = {};
			obj['total'] = total;
			obj[url] = notes;
			console.log(obj)
			chrome.storage.local.set(obj, function () {
				if ($('.note').length == 1) {
					AddNote()
				}
				else {
					var switch_id = $('#notes-list').find('[note-id="' + id + '"]').prev().attr('note-id')
					if (switch_id === undefined) {
						switch_id = $('#notes-list').find('[note-id="' + id + '"]').next().attr('note-id')
					}
					SelectNote(switch_id)
				}
				$('#notes-list').find('[note-id="' + id + '"]').remove()
			})
		})
	}
}

function modifiedString(date)
{
    return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
}

//chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//    insertDictionaryScript();
//});
//
//chrome.tabs.onCreated.addListener(function(tabId, changeInfo, tab) {         
//   insertDictionaryScript();
//});

document.addEventListener('DOMContentLoaded', function() {
	
	$('#edit-note').click(function() { $('.active').addClass('active-alt') })

	$('.add-note').click(function() { AddNote() })

	$('.add-sticky').click(function() { AddSticky() })

	$('.delete-note').click(function() { DeleteNote($('#edit-note').attr('note-id')) })

	$('#edit-note').on('keyup', function() { SaveNote() })



	getCurrentTabUrl(function (url) {
		console.log(url)

		chrome.storage.local.get('total', function(result) {
			console.log("total")
			console.log(result)
			total = result['total'];
			if(total === undefined) {
				total = 0;
				LoadNotes()
			}
			else {
				chrome.storage.local.get(url, function(result) {
					console.log("result")
					console.log(result);
					LoadNotes(result);
				})
			}
		})
	})
})


function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');
    console.log(url);
    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

