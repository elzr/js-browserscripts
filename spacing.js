// Experiment
// Keyboard Shortcut: alt-s

$('p').each(function() {$(this).html( $(this).html().replace(/([^.]\s+)(\b[A-Z][A-Za-z]*?\b( \b[A-Z][A-Za-z]*?\b)?( \b[A-Z][A-Za-z]*?\b)?( \b[A-Z][A-Za-z]*?\b)?)/g, function(match,p1,p2) { return p1+(p2.match(/^I$/) ? p2 : '<span class="caps">'+p2+'</span>')}) )})
$('p').each(function() {$(this).html( $(this).html().replace(/[^.]+\./,"$& <ul class=\"indent\"><li>").replace(/\. /g, '.</li><li>')+'</li></ul>' )})