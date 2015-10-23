/**
 * Main JS file for Swayze behaviours
 */

/*globals jQuery, document */
(function (w, h, $, undefined) {
  "use strict";


  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }
  // if /#blabla[leading]blabla ... we need to redirect to the platform !
  var hash = w.location.hash;
  var lang = getParameterByName("lang");
  var langstr = lang=="" ? "" : "?lang="+lang;
  if(hash.indexOf("c[leading]")!=-1) {
    var redirect = "/inquiry"+langstr+hash;
    console.log("redirect to: "+redirect);
    window.location = redirect;
  }


  w.pol = w.pol || {};

  /*
      const
      ===
  */
  pol.DEBUG_NONE = 0;
  pol.DEBUG_VERBOSE = 2; // will show pol.log() stuff and pol.verbose() stuff
  pol.DEBUG_INFO = 3; // will show pol.log() stuff
  pol.DEBUG_ERROR = 4; // will show error only

  /*

      namespaces
      ====

  */
  pol.templates = {};
  pol.timers = {}; // timeout ids, keys are function names
  pol.listen = {};
  pol.cached = {};
  pol.events = {
    checkpoint_root_changed: 'pol_checkpoint_root_changed',
    checkpoint_root_discarded: 'pol_checkpoint_root_discarded',
    checkpoint_changed: 'pol_checkpoint_changed',
    checkpoint_discarded: 'pol_checkpoint_discarded',
    checkpoint_scroll: 'checkpoint_scroll'
  };


  /*
      
      vars
      ====

  */
  pol.checkpoints = []; // cfr. pol.scrollspy 
  pol.previous_checkpoint = '';// cfr. pol.scrollspy 

 

  

  /*

      decorate text string with html tags

      NB: we also have regular expression replace in helphers/index.js server side !
      (should be the same)
     ---
  */
  pol.decorate_aime = function(text) {
  var c = "$1·$2",
      m = "$1";
  var lang = pol.cached.timeline.attr('data-lang');
  c = "<a href='/ime/"+lang+"/voc/$1-$2' target='_blank'>"+c+"</a>";
  m = "<a href='/ime/"+lang+"/voc/$1' target='_blank'>"+m+"</a>";

  var cross = "<span class='modes'>[<span class='smallcaps'>"+c+"</span>]</span>";
  var mode = "<span class='modes'>[<span class='smallcaps'>"+m+"</span>]</span>";

  return text
    // acronyms
    .replace(/\[ */g,"[").replace(/ *\]/g,"]")
    .replace(/([^\[]) ([A-Z]{3,}) ([^\]])/g,"\$1 <span class='smallcaps'>\$2</span> \$3")
    // modecrosses
    .replace(/\[([A-Z]{2,})[\.\-·]([A-Z]{2,})\]/g, cross)
    .replace(/\[([A-Z]{2,})\]/g, mode);
  };

  Handlebars.registerHelper('aime', pol.decorate_aime);

  
  pol.templates.tweet = Handlebars.compile('<a class="tweet" href="{{link}}"><div class="published_at">{{published_at}}</div><h4><div class="author">{{{aime author}}}</div><div class="text">{{{aime message}}}</div></h4></a>');
  
  /*
      Printout the very last tweet

      options.url: url to medialab json twitter engine
      options.selector: jquery selector where the tweet should be appended to
  */
  pol.tweettify = function(options){
    pol.log('(pol.twettify) options', options);
    
    $.ajax({
      url: options.url
    }).done(function(data) {
      if(!data.length)
        return pol.error('no data received or wrong format, received:', data);

      pol.verbose('(pol.twettify) received', data.length, 'tweets');

      var last_tweet = data.shift(),
          last_tweet_date = new Date(last_tweet.date * 1000),
          tweet;
    
      $(options.selector)
          .empty()
          .append(pol.templates.tweet({
            published_at: last_tweet_date.getDate() +'.'+ (last_tweet_date.getMonth() + 1) + '.' + last_tweet_date.getFullYear(),
            author: last_tweet.screenname,
            message: last_tweet.message,
            link: last_tweet.link
          }));


    });
  };


  /*
    rescale section to fit window height and add omissis.
    First section will be smalle because of the header.
  */
  pol.resize = function(){
    pol.height = $(window).height();

    $('section').each(function(i, e){
      var el = $(this);
      if(i ==0){ // first section in page, consider the ovearll header height

      }else{
        //el.height(pol.height);
      }
    });

    $('header.menu').scrollToFixed({
      marginTop: 6,
      zIndex: 1002,
      dontSetWidth:true
    });
    $('#secondary-menu').scrollToFixed({
      marginTop: 37,
      zIndex: 1001,
      dontSetWidth:true
    });

    
    
    $('#blog-categories-menu').scrollToFixed({
      marginTop: 96,
      zIndex: 1003,
      dontSetWidth:true
    });


    pol.cached.footer.length && pol.cached.footer.scrollToFixed({
      bottom: 0,
      // marginTop: 95,
      limit: pol.cached.footer.offset().top,
      zIndex: 1003,
      dontSetWidth:true
    });

   /* $('#blog-menu').scrollToFixed({
      marginTop: 96,
      limit: pol.cached.footer.offset().top,//$("section.below").first().offset().top - 100,
      zIndex: 1000
    });*/
  };

  /*
    
      
      Set location.href dinamically (we're already there)
      ---
  */
  pol.set_location = function(target) {
    clearTimeout(pol.timers.set_location);
    pol.timers.set_location = setTimeout(function() {
      location.href=target;

    }, 550);

  }

  pol.hashchange = function(event) {
    


    
  };



  /*

  */
  pol.follow = function(checkpoint, y){
    pol.verbose('(pol.follow)', y, checkpoint);
  }


  /*
      Handle the scrollspy on window, looking for anchor elements.
  */
  pol.scrollspy = function(event) {
    
    var y = $(window).scrollTop(),
        ay, // anchor y
        checkpoint, // object visible (uppermost part of the scrreen)
        num_of_checkpoints = pol.checkpoints.length;

    //pol.verbose('(pol.scrollspy) y:', y, ', y-max:', y + pol.height/2);

    for(var i=0; i<num_of_checkpoints; i++) {
      ay = pol.checkpoints[i].top;

      if(ay < y)
        continue;

      if(i > 0 && ay > y + pol.height/2)
        checkpoint = pol.checkpoints[i-1]; //pol.verbose('... previous is visible', pol.checkpoints[i-1].id, pol.checkpoints[i-1].top)   
      else
        checkpoint = pol.checkpoints[i]; //pol.verbose('...', pol.checkpoints[i].id, pol.checkpoints[i].top);
      
      break; // take just the very first visible element in page
    }
    if(!checkpoint)
      return;
    // check actual checkpoint (second level maximum)
    if(!pol.previous_checkpoint) {
      pol.trigger(pol.events.checkpoint_changed, checkpoint);
      pol.trigger(pol.events.checkpoint_root_changed, checkpoint);

    } else if(pol.previous_checkpoint.name != checkpoint.name) {
      //pol.verbose('switching',pol.previous_checkpoint.name, '>>>', checkpoint.name);
      pol.trigger(pol.events.checkpoint_discarded, pol.previous_checkpoint);
      pol.trigger(pol.events.checkpoint_changed, checkpoint);

      if(pol.previous_checkpoint.root != checkpoint.root) {
        //pol.verbose('... switching root', pol.previous_checkpoint.name, '>>>', checkpoint.name);
      
        pol.trigger(pol.events.checkpoint_root_discarded, pol.previous_checkpoint);
        pol.trigger(pol.events.checkpoint_root_changed, checkpoint);
      }
    }

    pol.previous_checkpoint = checkpoint;
  }


  

  pol.listen.checkpoint_changed = function(event, checkpoint) {
    if(checkpoint)
      $('#to-'+checkpoint.name).addClass('active');
    else
      pol.verbose('(pol.listen.checkpoint_changed) checkpoint unregognized', checkpoint);
  };

  pol.listen.checkpoint_discarded = function(event, checkpoint) {
    if(checkpoint)
      $('#to-'+checkpoint.name).removeClass('active');
    else
      pol.verbose('(pol.listen.checkpoint_changed) checkpoint unregognized', checkpoint);
  };
  
  pol.listen.checkpoint_root_discarded = function(event, checkpoint_discarded) {
    pol.log('(pol.listen.checkpoint_root_discarded)', checkpoint_discarded.root);
    
    // disable active 
    $('a.to-anchor[href="#'+checkpoint_discarded.root+'"]').removeClass('active');

    switch(checkpoint_discarded.root){
      case 'the-blog':
        pol.colorify('#ffffff');
        break;
    }
  };

  pol.listen.checkpoint_root_changed = function(event, checkpoint) {
    if(!checkpoint){
       pol.verbose('(pol.listen.checkpoint_root_changed) checkpoint unregognized', checkpoint);
      return;
    }
    pol.log('(pol.listen.checkpoint_root_changed)', checkpoint.root);
    pol.cached.wrapper.attr('data-checkpoint', checkpoint.root);

    // disable active 
    $('a.to-anchor[href="#'+checkpoint.root+'"]').addClass('active');

    switch(checkpoint.root){
      case 'introduction':
      case 'the-project':
        pol.cached.footer.removeClass('active');
        break;
      case 'the-blog':
        pol.colorify('#ededed');
        pol.cached.footer.addClass('active');
        break;
      default:
        pol.cached.footer.addClass('active');
        break;

    }
  }

  pol.listen.checkpoint_scroll = function(){

  }

  /*
    Change color to main home page. Used in conjunction with checkpoints!
  */
  pol.colorify = function(color) {
    pol.cached.wrapper.animate({backgroundColor: color}, {queue: false});
    pol.cached.footer.find('.inner').animate({backgroundColor: color}, {queue: false});
    pol.cached.menu.animate({backgroundColor: color}, {queue: false}).find('.inner').animate({backgroundColor: color}, {queue: false});
  };

  /*
    Add timeline.js behaviours. works only if there is a div having id=timeline
  */
  pol.create_timeline = function(){
    var lang = pol.cached.timeline.attr('data-lang');
    var doc_en = 'https://docs.google.com/spreadsheet/pub?key=0An3vofkD9W6odEhmRF9GQ3ZzWlYxX3J5Z1VPcnh6aGc&output=html';
    var doc_fr = 'https://docs.google.com/spreadsheet/ccc?key=0An3vofkD9W6odFpURFRMaGFVTjRDNzdNQUtsbXhqRlE&usp=sharing';
    var docurl = lang=='fr' ? doc_fr : doc_en ;
    var timeline_config = {
        lang: "en",
        width: "480",
        debug: false,
        height: "600", //pol.cached.timeline.height(),
        start_at_slide: lang=='fr' ? '75':'66' ,
        start_zoom_adjust:  '6',
        source: docurl,
        //css: pol.cached.timeline.attr('data-css-url'),     //OPTIONAL PATH TO CSS
        js: pol.cached.timeline.attr('data-js-url'),
        embed_id: 'timeline',
        
    };
    createStoryJS(timeline_config);

    // we tryed to go fullscreen using css, but. well. simpler to open a new page (see ./timeline.html)
    // $("#timelinefullscreentoggle").click(function(e) {
    //   console.log("Toggling timeline fullscreen");
    //   var t = $("#timeline");
    //   t.parent().addClass("fullscreenedparent");
    //   var timeline_config_full = timeline_config;
    //   timeline_config_full.width = "100%";
    //   timeline_config_full.heigth = "100%";
    //   $("#timeline").html("");
    //   createStoryJS(timeline_config_full);
    //   $("#timeline").addClass("fullscreened");
    // });
  }

  pol.onload = function(event) {
    pol.debug = pol.DEBUG_NONE;
    pol.height = $(window).height();

    // enable 'default' events
    pol.log('(pol.onload) Poltergeist loaded');
    
    // add jquery element to cache
    pol.cached.wrapper = $("#wrapper");
    pol.cached.footer = $("#footer");
    pol.cached.menu = $("#secondary-menu");
    pol.cached.timeline = $("#timeline");



    for(var i in pol.events){
      pol.on(pol.events[i], pol.listen[i]);
    }

    
    ////////////////////////////////////////////////////////////
    // will fetch the latest contributions from AIME API and build a list
    var lang = pol.cached.timeline.attr('data-lang');
    //console.log("Getting contributions...");
    
    // var t = lang=='en' ? "Title" : "Titre";
    // var a = lang=='en' ? "Author" : "Auteur";
    // $("table#contributions").append('<tr>'+
    //   '<th class="title">'+t+'</td>'+
    //   '<th class="author">'+a+'</td>'+
    //   '</tr>');

    $.ajax({
      url: "/api/stats",
      dataType: "json",
    }).done(function(data) {
        data = data.result;

        var rows = data.contributions.map(function(e) {
        //var sp = e.author.name.split(" ");
        //var N = sp.shift();
        //sp.push(N);
        //e.reversed = sp.join(" ");
	e.sortkey=e.author.name+e.author.surname
  	e.author.displayname=e.author.surname+" "+e.author.name
	return e;
      });
      rows = rows.sort(function(a,b) {
        var nA = a.sortkey.toLowerCase();
        var nB = b.sortkey.toLowerCase();
        if(nA < nB) return -1;
        else if(nA > nB) return 1;
        return 0;
      });
      // var rowTempl = Handlebars.compile('<tr>'+
      //   '<td class="title"><a href="http://www.modesofexistence.org/ime/{{lang}}/{{id}}" target="_new">{{title}}</a></td>'+
      //   '<td class="author">{{author.name}}</td>'+
      //   '</tr>');
      var rowTempl = Handlebars.compile(
        '<div class="author {{css}}">{{author.displayname}}</div>'+
        '<div class="title"><a href="/aime/doc/{{id}}" target="_new">{{title}}</a></div>'+
        '<div class="lang">({{lang}})</div><br/>');
      var prev = "";
      rows.forEach(function(c) {
        if(c.author.displayname!="AIME Team" && c.author.displayname!="Bruno Latour") {
          c.title = c.title.length>48 ? c.title.slice(0,46)+".." : c.title;
          c.css = c.author.displayname == prev ? "opak" : "";
          $("#fetched_contributions_list_div").append( rowTempl(c) );  
          prev = c.author.displayname;
        }
      })
      
    });
    
  
    // $('p').css('text-align', 'justify').hyphenate('en-us');

    $(window).on('hashchange', pol.hashchange);
    pol.hashchange();

    $(document).on('click', 'a.to-anchor', function(event) {
      var target = $.attr(this, 'href').replace(/^\//,'').replace(/\//g,'--'), // anchor ids with subsection must be in the form section--subsection to handle location hash /#section/subsection
        el = $( target );

      if(el.length){
        event.preventDefault();
    
        $('body').animate({
          scrollTop: el.offset().top
        }, {
          duration: 500,
        });
        pol.set_location(target.replace(/--/g,'/'));
      };
    });
    
    pol.checkpoints = []// array of paragraphs
    $("a.anchor").each(function(i,e){
      var el = $(this),
          anchor_id = el.attr('id');

      pol.checkpoints.push({
        id: '#' + anchor_id.replace(/--/g,'/'),
        root: anchor_id.split('--').shift(),
        name: anchor_id,
        top: el.offset().top
      });
    });
    
    $(window).scroll(pol.scrollspy);
    //$('body').scrollspy({ target: '#navbar' })

    
    // Fill with tweets
    pol.tweettify({
      url: 'http://modesofexistence.org/tweets.json',
      selector: '#tweets'
    });

    // align summary baseline with their content baseline (use margin-top on ul)
    $(".summary").each(function(i,e) {
      var summary = $(this),
          section = summary.closest('section'),
          content = section.find('.content').first();
      
      if(content.length){
        summary.find('ul').css('margin-top', Math.max(content.position().top + 24, 96));
      }
    });

    // decorate section contents
    setTimeout(function(){
      pol.colorify('#ffffff');
      pol.resize();
      pol.scrollspy();
      pol.cached.footer.trigger('scroll.ScrollToFixed');

      pol.cached.wrapper.stickem({
        container: 'section',
        item: '.summary'
      }).scroll();

      // init timeline here
      pol.cached.timeline && pol.create_timeline();
    }, 100);
	};

  

  /*

      Logs and utils
      ====

  */
  pol.log = function(){
    if(pol.debug >= pol.DEBUG_INFO){
      try{
        var args = ['\t'].concat(Array.prototype.slice.call(arguments));
        console.log.apply(console, args);
      } catch(e){}
    }
  };

  pol.verbose = function(){
    if(pol.debug >= pol.DEBUG_VERBOSE){
      var index = '          ';
      pol.debug_index = pol.debug_index || 0;
      pol.debug_index++;
      index = index + pol.debug_index;

      try{
        var args = ['\t', index.substr(-6)].concat(Array.prototype.slice.call(arguments));
        console.log.apply(console, args);
      } catch(e){}
    }
  };

  pol.error = function(){
    try{
        var args = ['   /\\  \n  /  \\\n / !! \\ poltergeist error:'].concat(Array.prototype.slice.call(arguments));
        args.push('\n/______\\');
        console.log.apply(console, args);
    } catch(e){}
  };

  pol.on = function (eventType, callback) {
    $(window).on(eventType, callback);
  };

  pol.trigger = function (eventType, data) {
    $(window).trigger(eventType, data);
  };

  /*
    
      Init function, on WINDOW ready (because of webfonts!)
      ===
  */
  $(window).load(pol.onload);

}(window, Handlebars, jQuery));
