// Cite selected text by textile formatting it, properly indenting it, and embedding the website's metadata.
// Keyboard Shortcut: alt-c
// File name: quoting.js
// URL: https://raw.githubusercontent.com/elzr/js-browserscripts/master/quoting.js
// 1ago2018: Added Quanta Magazine at ICM 2018
// 25mar2018: Added proper date & author extraction from RibbonFarm
// 1jan2018: Added subtitle to FT extraction
// 25dec2017: made WeAt more strict because it was confusing cognitivemedium.com and medium.com
// 22dec2017: improved copypaste, minor tweaks to FT.com & Medium (Hackernoon), deactivated single quote transform
// 20dec2017: trimming ? params for all but YouTube, incredibly, direct copy/paste now works!
// 11dec2014: reformatting for Hacker News & Reddit!
// 10dec2014: more author & date extractions, for radar.oreilly.com, New Yorker, YouTube...
// 26aug2014: further tweaking of padding to get it right
// 22aug2014: trying to trim the padding that occasionally gets on _ and *, also deleting that weird ­ character that sometimes gets between words
// 22aug2014: attempt to remove blank line between paragraphs
// 8Aug2014: fixed Economist URl bug with blogs
// 28jul2014: closing single quote converted to double quote except for plurals
// 29nov2013: Economist URL shortening
// 10nov2013: fixed tabbing of +1 paragraphs
// 14oct2013: punctuation tweaks
// 11oct2013: fancy punctuation stripping
// 11sep2013: slight improvement to Amazon URL shortening
// 29jul2013: epoch dating
// 25jul2013: textile parse only once, better Amazon shortening
// First made into an independent file: 16 October 2012


(function () {
	function parseQuote($) {
		var quote = '',
			url = location.toString(),
			selection = window.getSelection().toString();
		DETAILS.boot($);

		url = shorten(url);
		var head = DETAILS.before + DETAILS.title + DETAILS.middle + url+' '+DATE.notch()+ DETAILS.after;

		quote += head;
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
		} else if( weAt('medium.com') ) {
			url = url.replace(/#[^#]*$/,'');
		} else if( weAt('economist.com') ) {
			var parse = url.match(/(https?:\/\/[^\/]+\/).*?\/.*?(\d{8,})/);
			parse && (url = 'https://www.economist.com/node/' + parse[2]);
		} else if( weAt('nytimes.com') ) {
			url = $('.story-short-url a').text();
		} else if( weAt('youtube.com') ) {
			//http://youtu.be/o6L6XeNdd_k
			var parse = url.match(/v=([^&]+)/);
			if(parse && (parse.length == 2)) {
				url = 'https://youtu.be/' + parse[1];
			}
		}
		if( !weAt('youtube.com') ) { 
			//parameters have become tracking noise 20dec2017
			url = url.replace(/\?.*$/,'');
		}
		//console.log(url);
		return url;
	};

	var DATE = {
		monthNames: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
		dayNames: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
		intReformat:function(DateInInts) { //YYYY-MM-DD expected
			var month = (DateInInts.match(/\b\d{1,2}\b\-/)||[''])[0],
				day = (DateInInts.match(/\b\d{1,2}\b$/)||[''])[0],
				year = (DateInInts.match(/\b\d{4}\b/)||[''])[0];
			var monthName = DATE.monthNames[ parseInt(month) - 1];
			return day+monthName+year;
		},
		reformat:function(date) { date = date.toLowerCase();
			var day = (date.match(/\b\d{1,2}\b/)||[''])[0],
				year = (date.match(/\b\d{4}\b/)||[''])[0],
				dayName = (date.match( new RegExp('\\b('+DATE.dayNames.join('|')+')') )||[''])[0],
				month = (date.match( new RegExp('\\b('+DATE.monthNames.join('|')+')') )||[''])[0];
			return dayName+day+month+year;
		},
		notch:function( time ) { time = time || new Date();
			//example 2013y9sep18wed-261d-14h44m04s539ms-5utc-1379533444539epoch
			var dateWords = (time+'').toLowerCase().split(' '),
				hourMinSec = dateWords[4].split(':'),
				start = new Date(time.getFullYear(), 0, 0),
				diff = time - start,
				oneDay = 1000 * 60 * 60 * 24,
				dayOfTheYear = Math.floor(diff / oneDay);

			return (dateWords[3]+'y'+(time.getMonth()+1)+dateWords[1]+dateWords[2]+dateWords[0]+'-'+
				dayOfTheYear+'d-'+
				hourMinSec[0]+'h'+hourMinSec[1]+'m'+hourMinSec[2]+'s'+time.getMilliseconds()+'ms'+
				(-1*time.getTimezoneOffset()/60)+'utc-'+
				time.getTime()+'epoch');
		}
	};

	function weAt(domain) {
		domain = new RegExp( '\\/\\/([^\\/]*\\.)?' + domain.replace(/\./,'\\.'), 'i' );
		return location.toString().match( domain );
	}

	// **** DETAILS ****
	var DETAILS = {
		before:'', middle:'', after:'', title:'',
		boot:function($) { this.set.title();
			if( weAt('economist.com') ) { this.economist($);
			} else if( weAt('safaribooksonline.com') ) { this.safari($);
			} else if( weAt('radar.oreilly.com') ) {
				this.set.author( $('a[rel=author]') );
				this.middle = '('+$('span.entry-date').text().trim()+') ';
			} else if( weAt('quantamagazine.org') ) {
				this.set.author( $('.sidebar__author h3').first() );
				var date = $('.post__sidebar__content .h6').first().text();
				this.middle = '('+ DATE.reformat( date) +') ';
			} else if( weAt('newyorker.com') ) {
				this.set.author( $('a[rel=author]') );
				var date = $('*[itemprop=datePublished]').attr('content').match(/\d+/g);
				this.middle = '('+date[2]+DATE.monthNames[parseInt(date[1])-1]+date[0]+') ';
				this.set.subtitle( $('#masthead h2') );
			} else if( weAt('youtube.com') ) {
				this.set.author( $('.yt-user-info') );
				var date = $('.watch-time-text').text().replace(/\*/g,'').replace(/Published on /,'')
				this.middle = '('+DATE.reformat(date)+') ';
			} else if( weAt('news.ycombinator.com') ) {
				var subtext = $('.subtext');
				this.set.author( subtext.find('a:first') );
				var date = subtext.contents().eq(3).text().replace(/\|/,'').trim();
				this.middle = ' '+subtext.find('span:first').text().replace(/ /,'')+' ('+date+') ';
			} else if( weAt('reddit.com') ) {
				var OP = $('#siteTable'); //OP
				this.set.author( OP.find('.author') );
				var date = OP.find('time:first').text();//.attr('datetime');
				var points = OP.find('.score.unvoted').text();
				this.middle = ' '+points+'points ('+date+') ';
			} else if( weAt('theatlantic.com') ) {
				this.set.author( $('.metadata .authors') );
				this.middle = '('+DATE.reformat( $('.metadata time').text() )+') ';
				this.set.subtitle( $('.dek[itemprop=description]') );
			} else if( weAt('medium.com') || weAt('hackernoon.com') || weAt('magenta.as')  ) {
				this.set.author( $('[data-action-source=post_header_lockup]:last, .postMetaLockup--authorWithBio a.ds-link.ds-link--styleSubtle, .postMetaHeader .postMetaInline-feedSummary a, .metabar-block .avatar-span, .postMetaInline--authorDateline a') );
				//this.middle = ' ('+ DATE.reformat( GLOBALS.embedded.post.virtuals.firstPublishedAtEnglish ) +') ';
				var date = $('time:first').attr('datetime').replace(/T.*$/,'');
				//var date = $('span.postMetaInline--supplemental:first').text();
				this.middle = '('+ DATE.intReformat( date) +') ';
				this.set.subtitle( $('.section-content h4') );
			} else if( weAt('blogspot') ) {
				this.set.author( $('.profile-data a[rel=author]') );
				var date = $('h2.date-header').text().trim();
				this.middle = '('+DATE.reformat(date)+') ';
			} else if( weAt('ted.com') ) {
				this.set.author( $('meta[name=author]') );
				$('.player-hero__meta__label').remove();
				var date = $('.player-pip__meta .player-pip__meta__value:first, .player-hero__meta span:eq(1)').text().trim();
				var duration = $('.player-pip__meta .player-pip__meta__value:last, .player-hero__meta span:eq(0)').text().trim().replace(/:/,'m')+'s';
				this.middle = '('+DATE.reformat(date)+') '+duration+' ';
				this.set.subtitle( $('p.talk-description') );
			} else if( weAt('elfinanciero.com.mx') ) {
				this.set.author( $('.details-box span.important, .blog-author, .author-name').first() );
				var date = parseInt( $('.publishDate:first').attr('data-timestamp') * 1e3 );
				this.middle = '('+DATE.notch( new Date(date) )+') ';
			}  else if( weAt('aeon.co') ) {
				this.set.author( $('span.article-card__authors__inner').first() );
				var date = $('.article__date').text();
				this.middle = '('+DATE.reformat(date)+') ';
			}  else if( weAt('ft.com') ) {
				this.set.author( $('.topper__columnist-name, .article-info__byline, .article__byline-tag') );
				var date = $('.article__timestamp, .article-info__timestamp').attr('title');
				this.middle = '('+DATE.reformat(date)+') ';
				this.set.subtitle( $('.topper__standfirst') );
			}  else if( weAt('stratechery.com') ) {
				var date = $('time.entry-date.published').text();
				this.middle = '('+DATE.reformat(date)+') ';
			}  else if( weAt('ribbonfarm.com') ) {
				var date = $('.date.published.time').text();
				this.middle = '('+DATE.reformat(date)+') ';
				this.set.author( $('.author.vcard') );
			}
		},
		set:{
			title:function() { DETAILS.title = document.title;
				if( weAt('ted.com') ) {
					DETAILS.title = DETAILS.title.replace(/^[^:]+\:\s*/,'').replace(/ \| TED.com$/,'').replace(/ \|[^|]*$/,'');
				}
				DETAILS.title = '_'+ DETAILS.title.replace(/^Amazon\.com\s*\:\s*/,'').replace(/—/g,'-') +'_ ';
				return DETAILS.title;
			},
			author:function(author) {
				author = author.first();
				DETAILS.before = (author.text() || author.attr('content') || '').trim()+' ';
			},
			subtitle:function(text) { text = text.text().trim();
				text && (DETAILS.after = "\n\t__"+ text.replace(/_/g,'') +"__");
			}
		},
		economist:function($) {
			var article = $('article[itemtype], #column-content').first();
				article.remove('.source');
			var date = article.find('time[itemprop=dateCreated], .date-created, .dateline').text();
			if(date) {
				date = date.replace(/(\d\d)(th|st|nd|rd)/,'$1');
				date = '('+DATE.reformat( date )+') ';
				this.middle = date;
				var rubric = article.find('.blog-post__rubric,.rubric').text().trim();
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
				this.middle = DATE.reformat( date )+' ('+publisher+') isbn:'+isbn+' ';
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
				//replace(/([^s])’([^\w>]|$)/g, "$1\"$2"). //closing single quote converted to double quote except for plurals
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

		var out = parseQuote($);
		console.log( out );
		//alert( out );
		window.QUOTING = out;

		document.addEventListener('copy', captureCopy);
		document.execCommand('copy');

		reformat.boot($);
	}

	function captureCopy(e) {
		e.preventDefault();
		e.clipboardData.setData('text/plain', window.QUOTING);
		document.removeEventListener('copy', captureCopy);
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

