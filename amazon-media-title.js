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
			text().trim().replace(/ \[[^\]]+\]/g,'').replace(/\s*\n.*$/,'');
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
		var day = date.match(/\d{1,2}/)[0],
			year = date.match(/\d{4}/)[0],
			month = date.match(/\b[a-z]+\b/i)[0].toLowerCase().slice(0,3);
		return day+month+year;
	}
	function publisherProcess(str) {
		return str.replace(/(;[^\)]*)?\s+\(/,' (').replace(/\(([^)]+)\)$/,
			function(match, date) {
				return dateReformat(date);
			}).replace(/(.+?) (\S+)$/,"$2 ($1)")+' ';
	}
	function extractMedia($) {
		var title = cleanText( getExisting(['h1#title', 'span#btAsinTitle'])),
			author = getExisting([ 'div#byline .author .a-link-normal.contributorNameID:first', 'div#byline .author .a-link-normal:first', '.contributorNameTrigger:first', 'h1.parseasinTitle + a', 'h1.parseasinTitle + span > a:first']).text().trim(),
				authorContribution = ' '+getExisting([ 'div#byline .author .a-link-normal:first + .contribution', 'div#byline .author:first .contribution', 'h1.parseasinTitle + span > span.byLinePipe:first' ]).text().trim(),
			secondAuthor = $('div#byline .author + .author .a-link-normal.contributorNameID:last, div#byline .author + .author .a-link-normal:last, .contributorNameTrigger:eq(1), h1.parseasinTitle + span > a:last').text().trim(),
				//div#byline .author .a-declarative > .a-link-normal
				secondAuthorContribution = ' '+getExisting([ 'div#byline .author + .author > .contribution:last', 'h1.parseasinTitle + span > span.byLinePipe:last' ]).text().trim(),
			productDetails = getExisting(['#productDetailsTable .content', 'div.pdTab table', 'table td.bucket']),
			pages = productDetails.find('li:contains(pages), li:contains(Seiten)').text().match(/\d+/),
			publisher = productDetails.find('li:contains(Publisher), li:contains(Verlag)').text().match(/: (.*)/),
			shippingWeight = extractWeight( productDetails.find('li:contains(Shipping Weight), tr.size-weight td.value:first') ),
			itemWeight = extractWeight( productDetails.find('li:contains(Item Weight)') ),
			price = $('#combinedPriceBlock span.a-color-price, #tmmSwatches span.a-color-price').text().trim().replace(/\$([\d\.]+)/,"$1usd"),
			url = location.toString();
		

		secondAuthor = secondAuthor ? ', '+secondAuthor : '';
		publisher = publisher ? publisherProcess(publisher[1]) : '';
		pages = pages ? pages[0]+'p ' : ' ';
		price = price ? price+' ' : '';
		(authorContribution.match(/author|auteur/i) || authorContribution.match(/^\s$/)) && (authorContribution = '');
		(secondAuthorContribution.match(/author|auteur/i) || secondAuthorContribution.match(/^\s$/)) && (secondAuthorContribution = '');

		url = shorten(url);

		var extraction = (//(shippingWeight + itemWeight + 
			price+author+authorContribution + secondAuthor+secondAuthorContribution +
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
			var parseId = str.match(/(https?:\/\/[^\/]+\/).*?\/dp\/([^\/]+)(\/|$)/),
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
