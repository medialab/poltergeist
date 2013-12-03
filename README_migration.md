#### PRO

- easy markdown ! _links_ *styles* [link](http://modesofexistence.org)
- super light code + fast ( simple node.js + nosql)
- disqus features
  - no registration possible
    - comments need approval 
  - spam detection
    - import from wordpress (?)

- post date, tags
- easy customisable (handlebars)
- import posts from wordpress (using plugin)
  - keep post date, tags

#### AGAINST

- no index page (only pagination) but (done) easy to distinguish routes / vs /page/n
- disqus comments on the cloud
- simple metadata (no author by article)
- features to wait for:
  - multilanguage
  - search

#### Migration

- posts (~50)
  - use ghost export WP plugin > .json
    - /ghost/debug to import
- media (~40)
  - use cloudinary.com to export all medias
- comments (~20 on 5 pages)
  - migrate to disqus using WP plugin
    - build .csv with urls correspondances
    - disqus > tools > import .csv