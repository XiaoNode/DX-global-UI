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
    var _ns = Pattaya.Global.ns("UI", Pattaya.Global)
    
	/**
     * Pattaya.Global.UI.dialog | Pattaya.Global.UI.alert | Pattaya.Global.UI.tip
     */
    _ns.dialog || (function() {
        var dialog = function(content, settings) {
			var settings = $.extend(true,{
				usePanel: true,
				animationSpeed: 250,
				animationTop:   100,
				autoClose:      false,
				showClose:      true,
				draggable:      false,
				buttons:        true,
				customClass:    "",
				iconType:       "",
				modal:          true,
				overlayClose:   true,
				overlayOpacity: .2,
				overlayColor:   "#000",
				title:          "",
				type:           "",
				width:          "auto",
				height:         "auto",
				top:            "",
				ajax: {
					loadWidth:  "auto",
					loadHeight: "auto",
					data:       null,
					done:       $.noop,
					fail:       $.noop,
					always:     $.noop
				},
				iframe:{
					loadWidth:  "auto",
					loadHeight: "auto",
					loaded:     $.noop
				},
				onClose:        null
			}, settings);
				
			var d = {};
				
			var _init = function(){
				/* overlay */
				if (settings.modal) {
					// create the overlay
					d.overlay = $('<div>').css({
						'background': settings.overlayColor,
						'position': 'fixed',
						'left':     0,
						'top':      0,
						'opacity':  settings.overlayOpacity,
						'z-index':  _ns.zIndex.getLatest()
					});
					
					if (settings.overlayClose){
						// when the overlay is clicked remove the overlay and the dialog box from the DOM
						d.overlay.bind('click', d.close);
					}
					
					// append the overlay to the DOM
					d.overlay.appendTo('body');
				}
				
				/* dialog box */
				d.dialog = $('<div></div>', {
					'class':     (settings.usePanel ? 'dialogbox' : '') + (settings.customClass ? ' ' + settings.customClass : '')
				}).css({
					'position':   'absolute',
					'left':       0,
					'top':        0,
					'z-index':    _ns.zIndex.getLatest(),
					'visibility': 'hidden'
				}).html('<table class="tb"><tr><td></td></tr></table>');
				
				/* dialog data container */
				var container = $('td', d.dialog); 
				
				/* dialog header */
				if (settings.usePanel && settings.title)
				{
					var header = $('<div></div>', {
						'class':    'hd'
					}).html('<div class="title">'+settings.title+'</div>');
					
					if(settings.showClose){
						header.append('<a class="close" href="javascript:void(0)" title="close">close</a>');
						
						header.find(".close").bind("mousedown",function(){return false;}).bind('click',function(){
							d.close();
						});
					}
					
					header.appendTo(container);
				}
				
				/* dialog body */
				var body = $('<div>', {
					'class':    'bd' + (settings.icon_type ? ' dialog_icon ' + ('dialog_icon' + settings.iconType) : '')
				}).css({
					'width':  settings.width,
					'height': settings.height
				});
				
				if(typeof(content) == "string" && content.indexOf(":") > 0) {
					var index = content.indexOf(':'),
						prefixContent = content.substring(0, index),
						conContent = content.substring(index + 1);
					
					switch(prefixContent) {
						case "id":
							content = $("#" + conContent).html();
							
							break;
						case "ajax":
							d.html = function(con) {
								body.html(con);
								
								body.css({
									'width': settings.width,
									'height': settings.height
								});
								
								draw();
							};
							
							content = $('<div>',{'class': 'dialog_content_loading'});
							content.css({
								'width':  (settings.ajax.loadWidth == "auto" ? settings.width : settings.ajax.loadWidth),
								'height': (settings.ajax.loadHeight == "auto" ? settings.height : settings.ajax.loadHeight)
							});
							
							body.css({
								'width':  "auto",
								'height': "auto"
							});
							
							$.ajax({
								data: settings.ajax.data,
								url:  conContent
							}).done(function(data){
								settings.ajax.done(d, data);
							}).fail(function(){
								var a = settings;
								settings.ajax.fail(d);
							}).always(function(){
								settings.ajax.always(d);
							});
							
							break;
						case "iframe":
							var loading = $('<div>',{'class': 'dialog_content_loading'}).css({
												'width':  (settings.iframe.loadWidth == "auto" ? settings.width : settings.iframe.loadWidth),
												'height': (settings.iframe.loadHeight == "auto" ? settings.height : settings.iframe.loadHeight)
											}),
											
								iframe = $("<iframe>", {'class': 'dialog_iframe'}).css({
									'width':   '100%',
									'height':  '100%',
									'display': 'none'
								}).attr('src', conContent).load(function(){
									loading.remove();
									body.addClass('bd_iframe').css({
										'width':  settings.width,
										'height': settings.height
									});
									iframe.show();
									settings.iframe.loaded(d);
								});
								
							body.css({
								'width':  "auto",
								'height': "auto"
							});
							
							content = $('<div>').append(loading).append(iframe);
							
							break;
					}
				}

				body.html(content).appendTo(container);
				
				/* dialog footer */
				if (settings.usePanel && settings.buttons) {
					// create the button bar
					var footer = $('<div>', {
						'class':    'ft'
					}).appendTo(container);

					$.each(settings.buttons, function(name, value) {
						// create button
						var button = $('<a>', {
							'class':	'btn',
							'href' :    'javascript:void(0)'
						}).html(value);

						// when the button is clicked
						button.bind('click', function() {
							d.close(name);
						});

						// append the button to the button bar
						button.prependTo(footer);
					});
				}

				// insert the dialog box in the body DOM
				d.dialog.appendTo('body');

				// if the browser window is resized
				$(window).bind('resize', draw);
				
				if (settings.autoClose !== false) {
					setTimeout(d.close, settings.autoClose);
				}
				
				// draw the overlay and the dialog box
				draw();
				
				if(settings.draggable){
					drag();
				}
			};
			
			d.close = function() {
				if (settings.onClose && typeof settings.onClose == 'function') {
					if(settings.onClose(arguments[0]) === false){
						return;
					}
				}
				
				$(window).unbind('resize', draw);
				
				//setting close effects
				var fx = { };
				
				switch(settings.type) {
					case 'tip':
						var top = d.dialog.offset().top;
						
						d.dialog.css('top', top);
						
						top = top > settings.animationTop ? (top - settings.animationTop) : 0;
						
						fx = {top: top};
						break;
					case 'messager':
						break;
					default:
						break;
				}
				
				// if an overlay exists
				if (d.overlay) {
					d.overlay.animate({
						opacity: 0
					},
					settings.animationSpeed,
					function() {
						d.overlay.remove();
					});
				}
				
				
				fx.opacity = 0;
				
				d.dialog.animate(
					fx,
					settings.animationSpeed,
					function() {
						d.dialog.remove();
					}
				);
				
				return false;
			};
					
			var draw = function() {
				var winWidth = $(window).width(),
					winHeight = $(window).height(),
					dialogWidth = d.dialog.width(),
					dialogHeight = d.dialog.height(),
					scrollTop,
					scrollLeft,
					position,
					left,
					top;
				
				if (settings.modal) {
					d.overlay.css({
						'width':    winWidth,
						'height':   winHeight
					});
				}
				
				if(dialogHeight > winHeight || dialogWidth > winWidth) {
					scrollTop = $(window).scrollTop();
					scrollLeft = $(window).scrollLeft();
					position = 'absolute';
					left = winWidth > dialogWidth ? (winWidth + scrollLeft*2 - dialogWidth) / 2 : scrollLeft;
					top = winHeight > dialogHeight ? (winHeight + scrollTop*2 - dialogHeight) / 2 : scrollTop;
				} else {
					position = 'fixed';
					left = winWidth > dialogWidth ? (winWidth - dialogWidth) / 2 : 0;
					top = winHeight > dialogHeight ? (winHeight - dialogHeight) / 2 : 0;
				}
				
				if(settings.top)
					top = settings.top
				
				d.dialog.css({
					left:        left,
					top:         top,
					position:    position,
					'visibility':  'visible'
				});

				// move the focus to the first of the dialog box's buttons
				d.dialog.find('.ft a:last-child').focus();
			}
			
			var drag = function (){
				var left, top, dx, dy, $win = $(window), $doc = $(document);
				
				var $dragRegion = d.dialog.find(".hd").css('cursor', 'move');
				
				$dragRegion.bind("selectstart", function(){
					return false;
				});
				
				$dragRegion.mousedown(function(e){
					dx = e.clientX - parseInt(d.dialog.css("left"), 10);
					dy = e.clientY - parseInt(d.dialog.css("top"), 10);
					
					d.dialog.css('opacity', 0.8);
					$doc.mousemove(move);
					$dragRegion.mouseup(up);
				});
				
				function move(e){
					if (e.clientX - dx < 0) {
						left = 0;
					}
					else {
						if (e.clientX - dx > $win.width() - d.dialog.width()) {
							left = $win.width() - d.dialog.width();
						}
						else {
							left = e.clientX - dx;
						}
					}
					
					top = e.clientY - dy;
					
					d.dialog.css({
						left: left,
						top: top
					});
				}

				function up(e){
					d.dialog.css('opacity', 1);
					$doc.unbind("mousemove", move);
					$dragRegion.unbind("mouseup", up);
				}
			}

			_init();
			
			return d;
		};
		
		var _prompt = function(msg, title, icon, settings){
			var settings = $.extend({
					title:      title || " ",
					draggable:  true,
					modal:      false
				}, settings);
			
			dialog(msg, settings);
		};
		
		var alert = function(msg, title) {
			var settings = {
				iconType:   'alert',
				buttons:    {'OK' : "OK"}
			};
			
			_prompt(msg, title, '', settings);
		};
		
		var tip = function(msg) {
			var settings = {
				title: '',
				type: 'tip',
				buttons: false,
				autoClose: 5000,
				customClass: 'dialog_tip'
			};
			
			_prompt(msg, '', '', settings);
		};
		
        $.extend(true, _ns, {
			__version: "20120228",
            dialog: dialog,
			alert: alert,
			tip: tip
        });
    }());
	
}(this, Pattaya, jQuery));
