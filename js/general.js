/**
 * Main JS file for Swayze behaviours
 */

/*globals jQuery, document */
(function ($) {
  "use strict";

  /*
    decorate text string with html tags
  */
  function decorate_with_aime(text){
   
    var _t =  text
      .replace(/\[[^\]]*\]/g,function(s){
        return "<span class='modes'>" + s.replace(/[^\w\[·\]]/g,'') + "</span>"
      }).replace(/[A-ZÀÁÂÈÉÊÌÍÎÏÇÒÓÔŒÙÚÛ][A-ZÀÁÂÈÉÊÌÍÎÏÇÒÓÔŒÙÚÛ]+/g,function(s){
        return "<span class='smallcaps'>" + s + "</span>"
      });
    return _t;
  }


  /*
    


  */
	$(document).ready(function(){
    $('header.menu').scrollToFixed({
      marginTop: 6
    });
    $('#secondary-menu').scrollToFixed({
      marginTop: 37
    });

    var w_height = $(window).height();

    /*
      rescale section to fit window height and add omissis.
      First section will be smalle because of the header.
    */
    $('section').each(function(i, e){
      var el = $(this);
      if(i ==0){

      }else{
        //el.height()
      }
    });

		
    /*
      Fill with tweets
    */
    $.ajax({
      url: "http://aime.medialab.sciences-po.fr/tweets-aime.json"
    }).done(function (data) {
      var results = data || [],
          last_tweet,
          tweet,
          tweet_date;

      console.log(data);

      if(results.length){

        last_tweet = results.shift();
        console.log(last_tweet);

        tweet_date = new Date(last_tweet.date * 1000);

        tweet = $('<a/>',{'class':'tweet'}).append(
          '<div class="published_at">' +
            tweet_date.getDate() +'.'+ (tweet_date.getMonth() + 1) + '.' + tweet_date.getFullYear() +
          '</div>' +
          '<h4><div class="author">' +
            last_tweet.screenname +
          '</div>' +
          '<div class="text">' +
            decorate_with_aime(last_tweet.message) +
          '</div></h4>'
        )
          .attr('href', last_tweet.link)
          .attr('target', '_blank');

        $("#tweets")
          .empty()
          .append(tweet);

      } else {
        console.log('no data received fron twitter!');
      }
       
    });
	});

}(jQuery));