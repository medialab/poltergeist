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
  Handlebars.registerHelper('aime', function(text) {
    var _t =  text
      .replace(/\[[^\]]*\]/g,function(s){
        return "<span class='smallcaps'>" + s.replace(/[^\w\[·\]]/g,'') + "</span>"
      }).replace(/[A-ZÀÁÂÈÉÊÌÍÎÏÇÒÓÔŒÙÚÛ][A-ZÀÁÂÈÉÊÌÍÎÏÇÒÓÔŒÙÚÛ]+/g,function(s){
        return "<span class='smallcaps'>" + s + "</span>"
      });
    return _t;
  });

  
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
  };

  /*
    
      Init function, on document ready
      ===
  */
	$(document).ready(function(){
    pol.debug = pol.DEBUG_INFO;
    pol.resize();

    $('a.to-anchor').click(function(){
      $('body').animate({
        scrollTop: $( $.attr(this, 'href') ).offset().top
      }, 500);
      return false;
    });
    
    $('body').scrollspy({ target: '#navbar' })

		
    /*
      Fill with tweets
    */
    pol.tweettify({
      url: 'http://aime.medialab.sciences-po.fr/tweets-aime.json',
      selector: '#tweets'
    });

	});

}(window, Handlebars, jQuery));