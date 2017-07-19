$(function(){


	//exe example
	$(".btnExe").click(function(){
		var _$this = $(this),
			code = $(_$this.data("code-selector")).text();

			eval(code);
	});
	
	//append html
	$(".htmlAppended").each(function(i, ele){
		var _$this = $(ele),
			code = $(_$this.data("code-selector")).text();
		
		_$this.parent().after(_$this.html());

		eval(code);
	});
	
	//auto exe code
	$(".autoCode").each(function(i, ele){
		var _$this = $(ele),
			code = _$this.text();
			
		eval(code);
	});
	
});