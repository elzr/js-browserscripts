// Extract media details from Amazon (US & international).
// File name: amazon-media-title.js
// Keyboard Shortcut: alt-b
// 28aug2014: disable weight
//
// BUGS:
// there seems to be some weirdness after clicking Read More in a book's description that blocks the script with the msg:
// "[CSM] Alert invocation detected with argument"

(function () {
	function cleanText(el) {
		return el.find('span.a-size-medium').remove().end().
			text().trim().replace(/ \[[^\]]+\]/g,'').replace(/ \([^\)]+\)/g,'').replace(/\s*\n.*$/,'');
	}
	function getExisting(queryArray) {
		var existing = _(queryArray).find(function(query) {
			return (jQuery(query).length > 0);
		});
		return existing ? jQuery(existing) : jQuery('br:first'); //br is a hack to return something that text()'s to blank
	}
	function extractWeight(weight) {
		//console.log(weight);
		return weight.length > 0 ? '('+(parseFloat(weight.text().match(/[\d\.]+/))*toKilograms(weight)).toFixed(2)+'kg) ' : ''
	}
	function toKilograms(weight)  { var text = weight.text();
		var ounces = (text.match(/ounces/) ? 0.0283495 : 1),
			pounds = (text.match(/pounds/) ? 0.453592 : 1);
		return ounces*pounds;
	}
	function dateReformat(date) {
		var day = (date.match(/\b\d{1,2}\b/)||[''])[0],
			year = (date.match(/\b\d{4}\b/)||[''])[0],
			month = (date.match(/\b[a-z]+\b/i)||[''])[0].toLowerCase().slice(0,3);
		return day+month+year;
		return '';
	}
	function publisherProcess(str) {
		return str.replace(/(;[^\)]*)?\s+\(/,' (').replace(/\(([^)]+)\)$/,
			function(match, date) {
				return dateReformat(date);
			}).replace(/(.+?) (\S+)$/,"$2 ($1)")+' ';
	}
	function getAuthors($) {
		var authors = getExisting([ 'div#byline .author .a-link-normal.contributorNameID', 'div#byline .author .a-link-normal', '.contributorNameTrigger', 'h1.parseasinTitle + a', 'h1.parseasinTitle + span > a']),
			 contribs = getExisting([ 'div#byline .author .contribution', 'div#byline .author .a-link-normal + .contribution', 'h1.parseasinTitle + span > span.byLinePipe' ]);
			console.log('contribs', contribs);
			console.log('contribs.length', contribs.length);
		return _(authors).map( function(author, i) {
			console.log('i', i);
			console.log('c i 0 ', contribs[i]);
			console.log('c i 1 ', $(contribs[i]));
			var contrib = contribs[i] ? ' '+$(contribs[i]).text().trim() : '';
			contrib = (contrib.match(/author|auteur/i) || contrib.match(/^\s$/)) ? '' : contrib.replace(/,/g,'');
			return $(author).text().trim()+contrib;
		}).join(', ');
	}
	function extractMedia($) {
		var title = cleanText( getExisting(['h1#title', 'span#btAsinTitle'])),
			authors = getAuthors($);
			productDetails = getExisting(['#productDetailsTable .content', 'div.pdTab table', 'table td.bucket']),
			pages = productDetails.find('li:contains(pages), li:contains(Seiten)').text().match(/\d+/),
			publisher = productDetails.find('li:contains(Publisher), li:contains(Verlag)').text().match(/: (.*)/),
			shippingWeight = extractWeight( productDetails.find('li:contains(Shipping Weight), tr.size-weight td.value:first') ),
			itemWeight = extractWeight( productDetails.find('li:contains(Item Weight)') ),
			price = $('#combinedPriceBlock span.a-color-price:first, #tmmSwatches span.a-color-price:first').text().trim().replace(/\$([\d\.]+)/,"$1usd"),
			url = location.toString();

		publisher = publisher ? publisherProcess(publisher[1]) : '';
		pages = pages ? pages[0]+'p ' : ' ';
		price = price ? price+' ' : '';

		url = shorten(url);

		var extraction = (//(shippingWeight + itemWeight + 
			price + authors +
			' _'+title+'_ ' + pages + publisher + url+' '+dateNotch())
		return extraction;
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

	function shorten(str) {
		if(str.match(/amazon\.([^\/]+?)\//)) {
			var parseId = str.match(/(https?:\/\/[^\/]+\/).*?dp\/([^\/]+)/),
				countryCodeDomain = str.match('amazon\.com') ? 'us' : str.match(/amazon\.([^\/]+?)\//)[1];
			parseId || (parseId = str.match(/(https?:\/\/[^\/]+\/).*?gp\/product\/([\w]+)/));
			if(parseId && (parseId.length >= 3)) {
				if(countryCodeDomain == 'us') {
					str = 'https://amzn.com/' + parseId[2];
				} else {
					str = 'https://amazon.'+countryCodeDomain+'/dp/' + parseId[2];
				}
			}
		}
		return str;
	};
	
	/* Script loading & running */
	//---------------------------------------------
	function withJquery(jQuery) {
		alert(extractMedia(jQuery));
	};

	function loadScript(src, callback) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = src;
		script.onload = function () { callback(jQuery); };
		document.getElementsByTagName("head")[0].appendChild(script);
	}

	function alreadyRan() {
		var ran = document.body.textiled;
		document.body.textiled = true;
		//console.log('ran', ran);
		return ran;
	}

	function checkJquery() {
		if(typeof jQuery != 'undefined') {
			withJquery(jQuery);
		} else {
			loadScript('https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js', withJquery);
		}
	}
	if(typeof _ != 'undefined') {
		checkJquery();
	} else {
		loadScript('http://underscorejs.org/underscore-min.js', checkJquery);
	}
})();
