// Cite selected text by textile formatting it, properly indenting it, and embedding the website's metadata.
// Keyboard Shortcut: alt-c
// File name: to-textile.js
// URL: https://raw.githubusercontent.com/elzr/js-browserscripts/master/quoting.js
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
// 10dec2014: more author & date extractions, for radar.oreilly.com, New Yorker, YouTube...
// 11dec2015: reformatting for Hacker News & Reddit!

(function () {
	function parseQuote($) {
		var quote = '',
			url = location.toString(),
			selection = window.getSelection().toString();
		details.get($);

		url = shorten(url);
		var title= '_'+document.title.replace(/^Amazon\.com\s*\:\s*/,'')+'_ ';
		title = details.before + title +
			details.middle + url+' '+dateNotch()+ details.after;

		quote += title;
		if(selection.match(/\S/)) {
			quote += "\n\t"+selection.replace(/\n\n/g,"\n").replace(/\n/g,"\n\t");
		}
		return quote;
	};

	// **** GENERAL ****

	function shorten(url) {
		if( weAt('amazon.com') ) {
			var parse = url.match(/(https?:\/\/[^\/]+\/).*?\/dp\/([^\/]+)(\/|$)/);
			parse || (parse = url.match(/(https?:\/\/[^\/]+\/).*?gp\/product\/([\w]+)/));
			if(parse && (parse.length >= 3)) {
				url = 'https://amzn.com/' + parse[2];
			}
		} else if( weAt('economist.com') ) {
			var parse = url.match(/(https?:\/\/[^\/]+\/).*?\/.*?(\d{8,})/);
			parse && (url = 'https://economist.com/node/' + parse[2]);
		} else if( weAt('nytimes.com') ) {
			url = $('.story-short-url a').text();
		} else if( weAt('youtube.com') ) {
			http://youtu.be/o6L6XeNdd_k
			var parse = url.match(/v=([^&]+)/);
			if(parse && (parse.length == 2)) {
				url = 'https://youtu.be/' + parse[1];
			}
		}
		//console.log(url);
		return url;
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

	function weAt(domain) {
		domain = new RegExp( '\\/\\/[^\\/]*' + domain.replace(/\./,'\\.'), 'i' );
		return location.toString().match( domain );
	}

	// **** DETAILS ****

	var details = {
		before:'', middle:'', after:'',
		months: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
		get:function($) {
			if( weAt('economist.com') ) {
				this.economist($);
			} else if( weAt('safaribooksonline.com') ) {
				this.safari($);
			} else if( weAt('radar.oreilly.com') ) {
				this.before = $('a[rel=author]').text().trim()+' ';
				this.middle = ' ('+$('span.entry-date').text().trim()+') ';
			} else if( weAt('newyorker.com') ) {
				this.before = $('a[rel=author]').text().trim()+' ';
				var date = $('*[itemprop=datePublished]').attr('content').match(/\d+/g);
				this.middle = ' ('+date[2]+this.months[parseInt(date[1])-1]+date[0]+') ';
			} else if( weAt('youtube.com') ) {
				this.before = $('.yt-user-info').text().trim()+' ';
				var date = $('.watch-time-text').text().replace(/\*/g,'').replace(/Published on /,'')
				this.middle = ' ('+this.dateReformat(date)+') ';
			} else if( weAt('news.ycombinator.com') ) {
				var subtext = $('.subtext');
				this.before = subtext.find('a:first').text().trim()+' ';
				var time = subtext.contents().eq(3).text().replace(/\|/,'').trim();
				this.middle = ' '+subtext.find('span:first').text().replace(/ /,'')+' ('+time+') ';
			} else if( weAt('reddit.com') ) {
				var OP = $('#siteTable'); //OP
				this.before = OP.find('.author').text().trim()+' ';;
				var time = OP.find('time:first').text();//.attr('datetime');
				var votes = OP.find('.score.unvoted').text();
				this.middle = ' '+votes+'points ('+time+') ';
			}
		},
		dateReformat:function(date) {
			var day = (date.match(/\b\d{1,2}\b/)||[''])[0],
				year = (date.match(/\b\d{4}\b/)||[''])[0],
				month = (date.match(/\b[a-z]+\b/i)||[''])[0].toLowerCase().slice(0,3);
			return day+month+year;
		},
		economist:function($) {
			var article = $('article[itemtype], #column-content');
				article.remove('.source');
			var date = article.find('.date-created, .dateline').text().trim();
			if(date) {
				date = '('+this.dateReformat( date )+') ';
				this.middle = date;
				var rubric = article.find('.rubric').text().trim();
				if(rubric) {
					rubric = "\n\t__"+rubric+"__";
					this.after = rubric;
				}
			}
		},
		safari:function() {
			var info = $('.detail-book .title-info');

			if(info) {
				var author = info.find('.author').text().trim().replace(/^by\s*/,''),
					publisher = info.find('.publisher').text().trim().replace(/^[^:]*:\s*/,''),
					date = info.find('.issued').text().trim().replace(/^[^:]*:\s*/,''),
					isbn = info.find('.isbn').text().replace(/\D/g,'');
				this.before = author+' ';
				this.middle = this.dateReformat( date )+' ('+publisher+') isbn:'+isbn+' ';
			}
		}
	}

	// **** REFORMAT ****

	var reformat = {
		boot:function($) {
			var that = this;
			if(!$('body').data('reformat')) {
				$('body').data('reformat', true);
				$('em, i, span.title').each(function() {
					$(this).html( 
						that.enclose( that.punctuation($(this).html()), '_' )
					);
				});
				$('b, strong').each(function() { 
					$(this).html(
						that.enclose( that.punctuation($(this).html()), '*' )
					);
				});
				$('p').each(function() { $(this).html(that.punctuation($(this).html())) });
				that.fora.boot($);
			};
		},
		enclose:function(text, tag) { //enclose with tag while trying to trim the padding that is ocassionally around the edges
			out = {
				left:{regex:/^\s*[:,.]?(\s|(&nbsp;))*/, match:false},
				right:{regex:/\s*[:,.!?]?(\s|(&nbsp;))*$/, match:false}
			};
			out.left.match = text.match(out.left.regex);
			out.right.match = text.match(out.right.regex);
			text = text.replace(out.left.regex, '').replace(out.right.regex, '');
			return (out.left.match ? out.left.match[0] : '') + tag + text + tag + (out.right.match? out.right.match[0] : '');
		},
		punctuation:function(text) {
			return text.
				replace(/([^\w>])–/g, "$1--"). //isolated en-dash
				replace(/–([^\w>])/g, "--$1"). //isolated en-dash
				replace(/–/g, '-'). //en-dash
				replace(/—/g, '--'). //em-dash
				replace(/“/g, '"'). //opening double quotes
				replace(/”/g, '"'). //closing double quotes
				//replace(/([^\w>]|^)‘/g, "$1\""). //opening single quote
				replace(/([^s])’([^\w>]|$)/g, "$1\"$2"). //closing single quote converted to double quote except for plurals
				replace(/’|‘/g, "'"). //opening & closing single quotes
				replace(/„/g, '"'). //lower opening double quotes
				replace(/“/g, '"'). //lower closing double quotes
				replace(/­/g, '') //weird ­ character that sometimes gets between words, it's not the common hyphen
		},
		fora:{
			boot:function($) {
				var url = location.toString();
				if( weAt('news.ycombinator.com') ) {
					this.hackernews($);
				} else if( weAt('reddit.com') && url.match(/\/(comments|user)/) ) {
					this.reddit($);
				}
			},
			hackernews:function($) {
				$('.default').each(function() {
					var comm = $(this); //comment
					comm.find('br').remove();
					comm.find('p:last').remove();
					comm.find('span.comment').css( {display:'block', marginTop:'15px'});

					var commHead = comm.find('.comhead');
					commHead.find('a:first').append(':<br/>');
					var time = commHead.contents().eq(1);
					time.replaceWith( time.text().replace(/ \|/,'') );
					var url = commHead.find('a:eq(1)');
					url.text( 'https://news.ycombinator.com/'+url.attr('href') );
				});
			},
			reddit:function($) {
				var comms = $('.nestedlisting .entry');
				comms.each(function() {
					var comm = $(this);
					var tagline = comm.find('.tagline');
					tagline.find('.expand, .userattrs, .RESUserTag, .voteWeight').remove();
					tagline.find('.author').append(':<br/>');

					tagline.find('.score').each(function() { var score = $(this);
						score.text( score.text().replace(/ /g,'') );
					});

					var created = tagline.find('time:first'),
						createdDate = new Date( created.attr('datetime') );
					//created.text( '('+created.attr('datetime')+')' );

					var edited = tagline.find('.edited-timestamp'),
						editedDate = new Date( edited.attr('datetime') ),
						delta = ((editedDate - createdDate)/60/60/1000).toFixed(2);
					edited.replaceWith( ' (+'+delta+'h edit)' );

					tagline.last().append( ' '+comm.find('.flat-list .first a').attr('href') );

					comm.find('.flat-list').remove();
				});
			}
		}
	};

	// **** Script loading & running ****
	//---------------------------------------------
	function withJquery($) {
		var css = ['::selection {background-color:#DC3855}'].join('\n');
		loadStyle(css);
		alert(parseQuote($));
		reformat.boot($);
	}

	function loadJquery(callback) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js";
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

	function loadStyle(css) {
		var style = document.createElement('style');
		style.type = 'text/css';
		//via http://stackoverflow.com/questions/524696/how-to-create-a-style-tag-with-javascript
		if (style.styleSheet){
		  style.styleSheet.cssText = css;
		} else {
		  style.appendChild(document.createTextNode(css));
		}
		document.head.appendChild(style);
	}
})();
