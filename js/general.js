/**
 * Main JS file for Swayze behaviours
 */

/*globals jQuery, document */
(function (w, h, $, undefined) {
  "use strict";

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
     ---
  */
  pol.decorate_aime = function(text) {
    var _t =  text
      .replace(/\[[^\]]*\]/g,function(s){
        return "<span class='smallcaps'>" + s.replace(/[^\w\[·\]]/g,'') + "</span>"
      }).replace(/[A-ZÀÁÂÈÉÊÌÍÎÏÇÒÓÔŒÙÚÛ][A-ZÀÁÂÈÉÊÌÍÎÏÇÒÓÔŒÙÚÛ]+/g,function(s){
        return "<span class='smallcaps'>" + s + "</span>"
      });
    return _t;
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

  pol.onload = function(event) {
    pol.debug = pol.DEBUG_INFO;
    pol.height = $(window).height();

    // enable 'default' events
    pol.log('(pol.onload) Poltergeist loaded');
    
    // add jquery element to cache
    pol.cached.wrapper = $("#wrapper");
    pol.cached.footer = $("#footer");
    pol.cached.menu = $("#secondary-menu");



    for(var i in pol.events){
      pol.on(pol.events[i], pol.listen[i]);
    }

    
   
    
  
    $('p').css('text-align', 'justify').hyphenate('en-us');

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
      url: 'http://aime.medialab.sciences-po.fr/tweets-aime.json',
      selector: '#tweets'
    });

    // align summary baseline with their content baseline (use margin-top on ul)
    $(".summary").each(function(i,e) {
      var summary = $(this),
          section = summary.closest('section'),
          content = section.find('.content').first();
      
      if(content.length){
        summary.find('ul').css('margin-top', content.position().top + 24);
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
      })
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