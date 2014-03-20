Poltergeist
===========

Here is the first ever [Medialab](http://medialab.sciencespo.fr) theme for Ghost.
extends the [Swayze theme](http://ghost.woothemes.com/) designed by Cobus Bester and developed by Jeffrey Pearce.

Installation
---
Install under `~/sites/Ghost/content/themes/` where `~/sites/` is the parent folder of our [fork of Ghost](https://github.com/medialab/Ghost/tree/poltergeist).
	
	cd ~/sites/Ghost/content/themes/
	git clone http://github.com/medialab/poltergeist.git
	cd ~/sites/Ghost/content/themes/poltergeist
	
For development purpose we use Grunt with Less minifier task for our marvellous poltergeist stylesheet and Uglify task for minify the js part - less marvellous.
Install node modules and execute grunt tasks:
	
	cd ~/sites/Ghost/content/themes/poltergeist
	npm install
	...
	grunt

Start Poltergeist:

	cd ~/sites/Ghost/
	npm start

Start Poltergeist in (pre)production:
	
	cd ~/sites/Ghost/
	NODE_ENV=preproduction npm start

Note that Less files and unminified js won't work under NODE_ENV != "development".
Normally npm start will start Ghost in development mode, preproduction is for testing minified files.


Beware
---


Ubuntu/Mac with nodejs properly installed.