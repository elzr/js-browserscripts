// Cite selected text by textile formatting it, properly indenting it, and embedding the website's metadata. Load jQuery if not present
// Keyboard Shortcut: alt-s
// File name: to-textile.js
//
// First made into an independent file: 16 October 2012
// 25jul2013: textile parse only once, better Amazon shortening
// 29jul2013: epoch dating
// 11sep2013: slight improvement to Amazon URL shortening
// 11oct2013: fancy punctuation stripping
// 14oct2013: punctuation tweaks
// 10nov2013: fixed tabbing of +1 paragraphs
// 29nov2013: Economist URL shortening
// 28jul2014: closing single quote converted to double quote except for plurals
// 8Aug2014: fixed Economist URl bug with blogs
// 22aug2014: attempt to remove blank line between paragraphs
// 22aug2014: trying to trim the padding that occasionally gets on _ and *, also deleting that weird ­ character that sometimes gets between words
// 26aug2014: further tweaking of padding to get it right

(function () {
	function parseQuote() {
		var quote = '',
			url = location.toString(),
			selection = window.getSelection().toString();

		url = shorten(url);

		quote += '_'+document.title.replace(/^Amazon\.com\s*\:\s*/,'')+'_ '+url+' '+dateNotch();
		if(selection.match(/\S/)) {
			quote += "\n\t"+selection.replace(/\n\n/g,"\n").replace(/\n/g,"\n\t");
		}
		return quote;
	};

	function dateNotch() {
		//example 2013y9sep18wed-261d-14h44m04s539ms-5utc-1379533444539epoch
		var now = new Date(), 
			dateWords = (now+'').toLowerCase().split(' '),
			hourMinSec = dateWords[4].split(':'),
			start = new Date(now.getFullYear(), 0, 0),
			diff = now - start,
			oneDay = 1000 * 60 * 60 * 24,
			dayOfTheYear = Math.floor(diff / oneDay);

		return (dateWords[3]+'y'+(now.getMonth()+1)+dateWords[1]+dateWords[2]+dateWords[0]+'-'+
			dayOfTheYear+'d-'+
			hourMinSec[0]+'h'+hourMinSec[1]+'m'+hourMinSec[2]+'s'+now.getMilliseconds()+'ms'+
			(-1*now.getTimezoneOffset()/60)+'utc-'+
			now.getTime()+'epoch');
	}

	function withJquery($) {
		alert(parseQuote());
		toTextile($);
	};

	function punctuation(text) {
		return text.
			replace(/([^\w>])–/g, "$1--"). //isolated en-dash
			replace(/–([^\w>])/g, "--$1"). //isolated en-dash
			replace(/–/g, '-'). //en-dash
			replace(/—/g, '--'). //em-dash
			replace(/“/g, '"'). //opening double quotes
			replace(/”/g, '"'). //closing double quotes
			replace(/([^\w>]|^)‘/g, "$1\""). //opening single quote
			replace(/([^s])’([^\w>]|$)/g, "$1\"$2"). //closing single quote converted to double quote except for plurals
			replace(/’|‘/g, "'"). //opening & closing single quotes
			replace(/„/g, '"'). //lower opening double quotes
			replace(/“/g, '"'). //lower closing double quotes
			replace(/­/g, '') //weird ­ character that sometimes gets between words, it's not the common hyphen
	}
	function enclose(text, tag) { //enclose with tag while trying to trim the padding that is ocassionally around the edges
		out = {
			left:{regex:/^\s*[:,.]?(\s|(&nbsp;))*/, match:false},
			right:{regex:/\s*[:,.!?]?(\s|(&nbsp;))*$/, match:false}
		};
		out.left.match = text.match(out.left.regex);
		out.right.match = text.match(out.right.regex);
		text = text.replace(out.left.regex, '').replace(out.right.regex, '');
		return (out.left.match ? out.left.match[0] : '') + tag + text + tag + (out.right.match? out.right.match[0] : '');
	}

	function toTextile($) {
		if(!$('body').data('toTextile')) {
			$('body').data('toTextile', true);
			$('em, i, span.title').each(function() {
				$(this).html( 
					enclose( punctuation($(this).html()), '_' )
				);
			});
			$('b, strong').each(function() { 
				$(this).html(
					enclose( punctuation($(this).html()), '*' )
				);
			});
			$('p').each(function() { $(this).html(punctuation($(this).html())) });
		};
	};

	function loadJquery(callback) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js";
		script.onload = function () { callback(jQuery); };
		document.getElementsByTagName("head")[0].appendChild(script);
	}

	function alreadyRan() {
		var ran = document.body.textiled;
		document.body.textiled = true;
		//console.log('ran', ran);
		return ran;
	}

	if(typeof jQuery != 'undefined') {
		withJquery(jQuery);
	} else {
		loadJquery(withJquery);
	}

	function shorten(str) {
		if(str.match(/amazon\.com/)) {
			var parse = str.match(/(https?:\/\/[^\/]+\/).*?\/dp\/([^\/]+)(\/|$)/);
			parse || (parse = str.match(/(https?:\/\/[^\/]+\/).*?gp\/product\/([\w]+)/));
			if(parse && (parse.length >= 3)) {
				str = 'https://amzn.com/' + parse[2];
			}
		} else if(str.match(/economist\.com/)) {
			var parse = str.match(/(https?:\/\/[^\/]+\/).*?\/.*?(\d{8,})/);
			parse && (str = 'https://economist.com/node/' + parse[2]);
		}
		//console.log(str);
		return str;
	};
})();
