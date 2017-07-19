/**
 * Pattaya.Global.UI
 *
 * Required: jQuery
 *
 * Version: 20120228
 *
 */

(function(window, Pattaya, $, undefined) {
    "use strict";
    var _ns = Pattaya.Global.ns("UI", Pattaya.Global);

    _ns.slide || (function() {
        var slide = function(settings) {
                settings = $.extend(true, {
                	a : 1
                }, settings);
                var init = function() {
                		var speed = 400,
                			play = 3000,
                			start = 0,
                			$this = $('#euro2012_box'),
                    		listLength = $this.find('li').length,
                    		li = $this.find('li:first'),
                    		liHeight = li.height();
                    		
                		li.clone().appendTo($this);
                    	
                    	setInterval(function() {
                    		if(start === listLength){
                    			start=1;
                    			$this.css('top',0).animate({'top' : -liHeight*start},speed)
                    		} else{
                    			start++;
                    			$this.animate({'top' : -liHeight*start},speed)
                    		}
                    	},play)
                    };
                init();
            };
            
        $.extend(true, _ns, {
            slide: slide
        });
    }());
}(this, Pattaya, jQuery));