/**
 * Pattaya.Global.UI
 *
 * Required: jQuery
 *
 * overview: HTML API wasn't completed
 *
 * Version: 20130306
 *
 */
(function(window, Pattaya, $, undefined) {
    "use strict";
    var _ns = Pattaya.Global.ns("UI", Pattaya.Global)
    
	/**
     * Pattaya.Global.UI.tooltips
     */
    _ns.tooltips || (function() {
        var tooltips = function(selector, options) {
		
			var HTML_TEMPLATE = '<div class="tooltips"><div class="tooltips-title"></div><span class="tooltips-arrow"></span></div>',
				defaultSettings = {
					title: "",
					template: "",
					trigger: "mouseover",
					placement: "bottom", //top, right, bottom, left
					offset: {
						x: 0,
						y: 0
					},
					fx: {
						duration: 200
					},
					autoHide: 0,
					showing: $.noop,
					hidden: $.noop
				},
				$trigger,
				$tooltips,
				DATA_ENABLE = "data-tooltips-enable";
			
			function init() {
			
				$trigger = $(selector);
				
				if (!$trigger.length) {
					return;
				}
				
				options = $.extend(true, defaultSettings, options);
				options.title || (options.title = $trigger.attr("title"));
				options.template || (options.template = HTML_TEMPLATE);
				
				$trigger.on(options.trigger, function(){
					
					if($tooltips) {
						show();
						return;
					}
					
					$tooltips = $(options.template)
									.find(".tooltips-title").html(options.title)
								.end();

					$tooltips.addClass("tooltips-" + options.placement).appendTo('body');

					show();
				});
				
				if(options.trigger === "mouseover" && options.autoHide === 0) {
					$trigger.on("mouseout", function(){
						hide();
					});
				}
				
				$(window).resize(function(e) {
					e.stopPropagation();
					if ($tooltips.is(":visible")) {
						setCoordinates();
					}
				});
			}

			function setCoordinates() {
				
				var triggerOffset = $trigger.offset(),
					winWidth = $(window).width(),
					winHeight = $(window).height(),
					docWidth = $(document).width(),
					docHeight = $(document).height(),
					maxWidth =  Math.max(winWidth, docWidth),
					maxHeight = Math.max(winHeight, docHeight),
					left,
					top,
					width = $tooltips.outerWidth(),
					height = $tooltips.outerHeight(),
					triggerWidth = $trigger.outerWidth(),
					triggerHeight = $trigger.outerHeight();
				
				switch(options.placement) {
					case "top":
						left = triggerOffset.left - (width / 2) + (triggerWidth / 2) + options.offset.x;
                        top = triggerOffset.top - triggerHeight - options.offset.y;
						break;
					case "right":
						left = triggerOffset.left + triggerWidth + options.offset.x;
                        top = triggerOffset.top - (height / 2) + (triggerHeight / 2) + options.offset.y;
						break;
					case "bottom":
						left = triggerOffset.left - (width / 2) + (triggerWidth / 2) + options.offset.x;
                        top = triggerOffset.top + triggerHeight + options.offset.y;
						break;
					case "left":
						left = triggerOffset.left - width - options.offset.x;
                        top = triggerOffset.top - (height / 2) + (triggerHeight / 2) + options.offset.y;
						break;
				}
				
				if((maxWidth - width) < left) {
					left = maxWidth - width
				}
				
				left = (left > 0 ? left : 0);
				
				$tooltips.css({
					"left": left,
					"top": top
				});
			}
			
			function show() {
				if($tooltips.data(DATA_ENABLE) === false) {
					return;
				} else {
					$tooltips.data(DATA_ENABLE, false);
				}
				
				if ($.isFunction(options.showing)) {
					options.showing.call($tooltips);
				}
				
				$tooltips.css({
					"display": "block",
					"visibility": "hidden",
					"position": "absolute",
					"z-index": Pattaya.Global.UI.zIndex.getLatest()
				});
				
				setCoordinates();
				
				$tooltips.css({
					"display": "none",
					"visibility": "visible"
				});
				
				if(!options.fx.duration) {
					$tooltips.show();
				} else {
					$tooltips.fadeIn(options.fx.duration);
				}
				
				if (options.autoHide) {
					setTimeout(function(){
						hide();
					}, options.autoHide);
				}
			}
			
			function hide() {
				if(!options.fx.duration) {
					$tooltips.hide();
				} else {
					$tooltips.fadeOut(options.fx.duration);
				}
				
				if ($.isFunction(options.hidden)) {
					options.hidden.call($tooltips);
				}
				
				$tooltips.data(DATA_ENABLE, true);
			}
			
			init();

			return {
				show: show,
				hide: hide
			}
		};

        tooltips.__version = "20130306";
        $.extend(true, _ns, {
            tooltips: tooltips
        });
    }());
	
}(this, Pattaya, jQuery));
