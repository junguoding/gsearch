;(function($) {
/*
 本插件遵从Apache协议 
 author:junguo
 QQ:1423844263
 EMAIL:junguoding@gmail.com
 ver 0.9.1
*/  	
var CSS = '<style type="text/css">\
.search_text{width:320px; border:1px solid #a0b3d6; padding:4px 0 4px 3px; font-size:1.1em;}\
.search_btn{padding:3px 12px 1px; overflow:visible; font-size:1.1em;}\
.search_scroll{width:323px; max-height:180px;_height:180px; border:1px solid #e0e0e0;background:white; position:absolute;overflow:auto; display:none;overflow:hidden;padding: 0 0 9px 9px;z-index:9999;}\
.search_scroll a{display:block; line-height:27px; color:#333333; text-decoration:none;font:16px/22px arial;}\
.search_scroll a:hover,.search_scroll a.on{background:#E5EAF7; color:#000; text-decoration:none;}\
</style>';
         $("head").append(CSS);
	var sdefault = {
		       sl:"",
		   getURL:"#",//获取数据地址
		  xoffset:0,//x偏移量
		  yoffset:0,//y偏移量
		    posOn:-1, 
		posScroll:0,
	 posScrollNum:9, 
   posScrolledNum:0,          
		 waitTime:500,                //两次键盘的忽略时间
		lastTime:0,
		Searchkey:$("#seach_key"),   //和SearchText 保持键值对,可选
		SearchScroll:"#SearchScroll", //提示滚动框
	    Scroll_w:"",
	    Scroll_h:"", 
		ScrollUpDown:$("#scrollUpDown"),
		SearchBtn:$("#SearchBtn"), //搜索按钮,可以忽略
		select:true,  //只是选择, false:点击或者enter 跳转
		border:false,
		creatUrlFun:"",
	    input_text:"请输入关键词!",
		hoverFlag:true
	};
	$.fn.gsearch = function(options) {
			if(typeof(options.Scroll_w)=="undefined"){
				options.Scroll_w = $(this).width();
			 }
		    sdefault = $.extend(sdefault,options);
			cacheData.SearchText = $(this);
			sdefault.sf=$(this);
	        $.gsearch($(this),sdefault);
			$(document).click(function(e){
				if(e.target.id!=sdefault.sf.attr('id')){
					 $.gsearch.scrollHide();	
					}
				  });
			
		};
	$.gsearch = function(input,options) {
		if (!input) { return;	}
        input.click(function(){ 
	      if($(this).val()==options.input_text){
		     $(this).val("");
		     $(this).focus();
		     return ;
		     }
		  }); 
	     input.focus( function(){
	            cacheData.userKeyword = $.trim(input.val());
					 if(cacheData.userKeyword){
							input.keyup();
						 }else{
							$.gsearch.scrollHide();
						 }
	      }
	   ).keyup(function(event){
				cacheData.userKeyword = $.trim(input.val());
				if(event.keyCode === KEY.LEFT || event.keyCode === KEY.RIGHT || event.keyCode === KEY.UP || event.keyCode === KEY.DOWN || event.keyCode === KEY.TAB || event.keyCode === KEY.ESC || event.keyCode === KEY.PAGEUP || event.keyCode === KEY.PAGEDOWN || event.keyCode === KEY.CTRL || event.keyCode === KEY.ALT){
					return;
				}else if(event.keyCode === KEY.ENTER){
					$.gsearch.scrollUpDown.itemEnter();
					return;
				}
				var newTime = new Date().getTime();
				if(newTime - sdefault.lastTime < sdefault.waitTime){
					return; 
				}
				$.gsearch.setPosition();
				if(cacheData.Cache[cacheData.userKeyword]=='null'||typeof(cacheData.Cache[cacheData.userKeyword])=='undefined'){
				     if(cacheData.userKeyword){
				      $.gsearch.loaddate(cacheData.userKeyword);
					 }else{
					  $.gsearch.scrollHide();
					 }
				}else{
					$.gsearch.creathtml(cacheData.userKeyword);
					}
					return ;
			}).keydown(function(event){
				if(event.keyCode === KEY.UP){
					$.gsearch.scrollUpDown.itemUp();
					return ;
				}else if(event.keyCode === KEY.DOWN){
					$.gsearch.scrollUpDown.itemDown();
					return ;
				}
			});
	 $(sdefault.SearchScroll).delegate("a","click",function(){
		 cacheData.SearchText.val($(this).html());
		 sdefault.Searchkey.val($(this).attr('data'));
		 $.gsearch.scrollHide();
	  });	
	 }	
	$.extend($.gsearch, {
		loaddate:  function(key){
				cacheData.reqKeyword = key;
				var loadData = function(){
					$.ajax({
						 url:"http://www.demo.com/sw-"+key+".html",
						type:"GET",
	                   jsonp: "callback",
					dataType:"jsonp",
					 success:function(data){
							if(data === "false"||data==''){
								$.gsearch.scrollHide();
							}else{
								cacheData.Cache[cacheData.reqKeyword] = data;
							    $.gsearch.creathtml(cacheData.reqKeyword);
							 }
						    }
					  });
					  return false;
				   }
				if(!cacheData.Cache[cacheData.reqKeyword]){
					loadData();	
				}else{
					$(sdefault.SearchScroll).css("display","inline-block").html(cacheData.Cache[cacheData.reqKeyword]);
					return;
				}
	    },
	   creathtml:function(reqKeyword){
		                var sc   = '';
						var data = cacheData.Cache[reqKeyword];
						for(i in data){
							     var text = unescape(decodeURI(data[i]['title']));
								     text = text.replace(/\%/g,"%25"); 
								 if(sdefault.select){
								   sc += '<a href="javascript:;" data="'+data[i]['url']+'">'+text+'</a>';
								 }else{
								   sc += '<a href="'+$.gsearch.geturl(text)+'">'+text+'</a>';
								  }
								}
								  $(sdefault.SearchScroll).css("display","inline-block").html(sc);
								  $(sdefault.SearchScroll).attr("class","search_scroll");
								  $(sdefault.SearchScroll).width(sdefault.Scroll_w-8);
								  if(sdefault.Scroll_h){
									 $(sdefault.SearchScroll).height(sdefault.Scroll_h);
									 }
								  
		   },	
	   scrollHide: function(){
					$(sdefault.SearchScroll).css("display","none");
					  sdefault.posOn = -1;
	       },
	   geturl:function(title){
	   	  return sdefault.creatUrlFun(title);
	   },
	  scrollUpDown : {
			itemUp:function(){ 
				if($(sdefault.SearchScroll+" a").length > 0 && sdefault.posOn > 0){
					$(sdefault.SearchScroll+" a:eq("+sdefault.posOn+")").removeClass("on");
					sdefault.posOn -=1;
					$(sdefault.SearchScroll+" a:eq("+sdefault.posOn+")").addClass("on");	
					cacheData.SearchText.val($(sdefault.SearchScroll+" a:eq("+sdefault.posOn+")").html());
					if(sdefault.posScrolledNum > 0){
						sdefault.posScroll -= 18;
						$(sdefault.SearchScroll).scrollTop(sdefault.posScroll);
						sdefault.posScrolledNum -= 1;	
					}
				}
			},
			itemDown:function (){
				if($(sdefault.SearchScroll+" a").length > 0 && sdefault.posOn < $(sdefault.SearchScroll+" a").length-1){
					if(sdefault.posOn === -1){
						sdefault.posOn += 1;
						$(sdefault.SearchScroll+" a:eq(0)").addClass("on");
						if($(sdefault.SearchScroll+" a").length > sdefault.posScrollNum){
							$(sdefault.SearchScroll).scrollTop(0);
						}
					}else{
						$(sdefault.SearchScroll+" a:eq("+sdefault.posOn+")").removeClass("on");
						sdefault.posOn +=1;
						$(sdefault.SearchScroll+" a:eq("+sdefault.posOn+")").addClass("on");
						if(sdefault.posOn > sdefault.posScrollNum){
							sdefault.posScroll += 18;
							$(sdefault.SearchScroll).scrollTop(sdefault.posScroll);
							sdefault.posScrolledNum += 1;
						}
					}
					cacheData.SearchText.val($(sdefault.SearchScroll+" a:eq("+sdefault.posOn+")").html());
				}
			},
			itemEnter:function(){
				if($(sdefault.SearchScroll+" a").length > 0 && sdefault.posOn >= 0 && sdefault.posOn < $(sdefault.SearchScroll+" a").length){
					cacheData.SearchText.val($(sdefault.SearchScroll+" a:eq("+sdefault.posOn+")").html());
					$.gsearch.openUrl($(sdefault.SearchScroll+" a:eq("+sdefault.posOn+")").attr('href'));
					return false;
				}else{
				    $.gsearch.openUrl($.gsearch.geturl(sdefault.sf.val()));	
					}
			 }
	    },
	  setPosition :function(){
		     if(!cacheData.x&&!cacheData.y){
				 cacheData.x = parseInt(cacheData.SearchText.offset().left)+sdefault.xoffset;
				 cacheData.y = parseInt(cacheData.SearchText.offset().top)+parseInt(cacheData.SearchText.height())+parseInt(sdefault.yoffset);
			      $(sdefault.SearchScroll).css("left",cacheData.x+"px");
			      $(sdefault.SearchScroll).css("top",cacheData.y+"px");
				 }
	   }, 
		openUrl :function(url){
				 window.location.href = url; 
			     $.gsearch.scrollHide();
	   }
	});
	var cacheData = {
		 SearchText:'',
		 reqKeyword:"",
		userKeyword:"", 
				  x:0,
				  y:0,
		     Cache:{} 
	};
	var KEY = {
		LEFT:37,
		UP: 38,
		RIGHT:39,
		DOWN: 40,
		TAB: 9,
		ESC: 27,
		PAGEUP: 33,
		PAGEDOWN: 34,
		CTRL:17,
		ALT:18,
		ENTER:13
	};
	})(jQuery);
