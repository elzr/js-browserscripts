// Quote selected text or page title for bookmarking
// Load jQuery if not present
// Begun on April 4, 2013

(function () {
	function parseQuote() {
		var quote = '',
			url = location.toString(),
			title = document.title,
			selection = window.getSelection().toString();

		url = shorten(url);

		if(selection) {
			title = selection.replace(/^\s*/,'').replace(/\s*$/,'');
		}

		quote += '_'+title+'_ '+url+' '+dateNotch();
		return quote;
	};

	function dateNotch() {
		//example 2013y9sep18wed-261d-14h44m04s539ms-5utc-1379533444539epoch
		var now = new Date(), 
			dateWords = (now+'').toLowerCase().split(' '),
			hourMinSec = dateWords[4].split(':')
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
	};

	function shorten(str) {
		if(str.match(/amazon\.com/)) {
			var parse = str.match(/(https?:\/\/[^\/]+\/).*?\/dp\/([^\/]+)(\/|$)/);
			parse || (parse = str.match(/(https?:\/\/[^\/]+\/).*?gp\/product\/([\w]+)/));
			if(parse && (parse.length >= 3)) {
				str = 'https://amzn.com/' + parse[2];
			}
		}
		return str;
	};

	function loadJquery(callback) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js";
		script.onload = function () { callback(jQuery); };
		document.getElementsByTagName("head")[0].appendChild(script);
	}

	if(typeof jQuery != 'undefined') {
		withJquery(jQuery);
	} else {
		loadJquery(withJquery);
	}
})();
