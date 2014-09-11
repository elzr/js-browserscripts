// Experiment.
// Keyboard Shortcut: alt-s

(function () {
	function spacing() {
		caps();
		pToUl();
	}
	function pToUl() {
		$('p').each(function() {
			$(this).html( $(this).html().
				replace(/[^.]+\./,"$& <ul class=\"spacingIndent\"><li>").
				replace(/\. /g, '.</li><li>')
				+'</li></ul>' 
			)
		});
	}
	function caps() {
		$('p').each(function() { var p = $(this);
			p.html( pToCaps(p.html()) );
		});
	}
		function pToCaps(p) {
			var word = '\\b[A-Z][A-Za-z\']*\\b',
				repeat = '(?:\\s+'+word+')?',
				capRegex = new RegExp(word+'('+repeat+repeat+repeat+repeat+')', 'g');
			return p.replace(capRegex, toCaps);
		}
		function toCaps(match, matchedWord, repeats, offset, substring) {
			console.log( repeats );
			console.log( substring(0,offset) );
			var isLineStart = substring(0,offset).match(/[^.:?!"]\s+$/);
			capped = (match.match(/^I('m)?$/) ? match : '<span class="spacingCaps">'+match+'</span>')
			return (isLineStart || repeats) ? capped : match;
		}
	
	/* Script loading & running */
	//---------------------------------------------
	function withJquery($) {
		if(true || !$('body').data('spacing')) {
			$('body').data('spacing', true);
			var css = ['ul.spacingIndent {list-style-type:none; font-family:inherit}',
							'ul.spacingIndent li {text-indent:}',
							'span.spacingCaps {background-color:#ccc}'
						].join('\n');
			loadStyle(css);
			spacing();
		}
	}

	function loadJquery(callback) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js";
		script.onload = function () { callback(jQuery); };
		document.getElementsByTagName("head")[0].appendChild(script);
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
