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

  /*
      
      vars
      ====

  */
  pol.checkpoints = []; // cfr. pol.scrollspy 
  pol.previous_checkpoint = '';// cfr. pol.scrollspy 

  /*

      Logs
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
      marginTop: 6
    });
    $('#secondary-menu').scrollToFixed({
      marginTop: 37
    });

    pol.footer = $('#footer');

    pol.footer.length && pol.footer.scrollToFixed({
      //bottom: 0,
      marginTop: 95,
      //limit: pol.footer.offset().top
    });
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
    

    var hashes = location.hash.split('/'),
        target = $('a.to-anchor[href="/'+hashes.join('/')+'"]'), // direct target, full hash
        parent_target;

    pol.verbose('(pol.hashchange)', location.hash, 'a.to-anchor[href="/'+hashes.join('/')+'"]');
    
    

    if(!target.hasClass('active')){
      $('a.to-anchor.active').removeClass('active');
      target.addClass('active');
    }

    // parent target classes
    while(hashes.length > 1) {
      hashes.pop();
      pol.verbose('...', hashes.join('/'));
      $('a.to-anchor[href="/'+hashes.join('/')+'"]').addClass('active')
    }

    
  };

  /*
      activate current anchor links, with href param of anchor elemnet
  */
  pol.anchorify = function(href){
    var hashes = href.split('/'),
        target = $('a.to-anchor[href="/'+hashes.join('/')+'"]');

    pol.verbose('(pol.anchorify)', hashes);

    if(!target.length)
      return;

    if(!target.hasClass('active')) {
      $('a.to-anchor.active').removeClass('active');
      target.addClass('active');
    }

    // parent target classes
    while(hashes.length > 1) {
      hashes.pop();
      pol.verbose('...', hashes.join('/'));
      $('a.to-anchor[href="/'+hashes.join('/')+'"]').addClass('active')
    }

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
        checkpoint = pol.checkpoints[i-1].id; //pol.verbose('... previous is visible', pol.checkpoints[i-1].id, pol.checkpoints[i-1].top)   
      else
        checkpoint = pol.checkpoints[i].id; //pol.verbose('...', pol.checkpoints[i].id, pol.checkpoints[i].top);
      
      break; // take just the very first visible element in page
    }

    
    if(checkpoint && checkpoint != pol.previous_checkpoint) {
      pol.log('(pol.scrollspy) new checkpoint:', checkpoint);
      pol.anchorify(checkpoint);
    }
    pol.previous_checkpoint = checkpoint;

    // evaluate footer
    // pol.footer.position().top
  } 

  /*
    
      Init function, on document ready
      ===
  */
	$(window).load(function(){
    pol.debug = pol.DEBUG_INFO;

    pol.height = $(window).height();
    pol.resize();

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
      var el = $(this);
      pol.checkpoints.push({
        id: '#' + el.attr('id').replace(/--/g,'/'),
        top: el.offset().top
      });
    });

    $(window).scroll(pol.scrollspy);
    //$('body').scrollspy({ target: '#navbar' })

		var summaries = $('.summary');
        summaries.each(function(i) {
            var summary = $(summaries[i]),
                next = summaries[i + 1],
                section = summary.next('section'),
                first_content_offset = 20,
                first_content;

            if(section.length) {
              first_content = section.find('.content');
              if(first_content.length) {
                //pol.verbose('found section content', first_content.first().position().top );
                first_content_offset = section.find('.content').first().position().top + 16;
              }
            }
              //

            summary.scrollToFixed({
                marginTop: 87,
                limit: function() {
                    var limit = 0;
                    if (next) {
                        limit = $(next).offset().top - $(this).outerHeight(true) - 100;
                    } else {
                        limit = $('#the-end').offset().top - $(this).outerHeight(true) - 100;
                    }
                    return limit;
                },
                zIndex: 999
            });

            summary.find('ul').css('padding-top', first_content_offset);
        });
    
    // Fill with tweets
    pol.tweettify({
      url: 'http://aime.medialab.sciences-po.fr/tweets-aime.json',
      selector: '#tweets'
    });

    // decorate section contents
    setTimeout(function(){$("#footer").trigger('scroll.ScrollToFixed')}, 100);
	});

}(window, Handlebars, jQuery));