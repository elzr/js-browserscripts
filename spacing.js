// Experiment.
// Keyboard Shortcut: alt-s

(function () {
	function spacing() {
		pToUl();
		caps();
	}
	function pToUl() {
		$('p').each(function() {$(this).html( $(this).html().replace(/[^.]+\./,"$& <ul class=\"spacing-indent\"><li>").replace(/\. /g, '.</li><li>')+'</li></ul>' )})
	}
	function caps() {
		$('p').each(function() {
			$(this).html( $(this).html().
				replace(/([^.]\s+)(\b[A-Z][A-Za-z]*?\b( \b[A-Z][A-Za-z]*?\b)?( \b[A-Z][A-Za-z]*?\b)?( \b[A-Z][A-Za-z]*?\b)?)/g,
					function(match,p1,p2) {
						return p1+(p2.match(/^I$/) ? p2 : '<span class="caps">'+p2+'</span>')
					})
				)
		});
	}
	
	/* Script loading & running */
	//---------------------------------------------
	function withJquery($) {
		if(!$('body').data('spacing')) {
			$('body').data('spacing', true);
			spacing();
		}
	}

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
})();
