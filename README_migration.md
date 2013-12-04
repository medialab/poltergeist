#### PRO

- easy markdown ! _links_ *styles* [link](http://modesofexistence.org) !(igs)[]
- super light code + fast + movable ( simple node.js + sqlite )
- disqus features (comments)
  - disqus allows: 
    - registration not required
    - moderation
  - spam detection
- post date, tags
- easy CUSTOMISABLE (handlebars + less)

#### AGAINST

- no static page
- no category
- no index page (only pagination) but (done) easy to distinguish routes / vs /page/n
- disqus comments on the cloud
- simple metadata (no author by article)
- features to wait for:
  - posts by tag (we already added it)
  - multilanguage
  - search

### Migration 

#### Data

- posts (~50)
  - use ghost export WP plugin > .json (date, tags)
    - /ghost/debug to import
- media (~40)
  - use cloudinary.com to export all medias
- comments (~20 on 5 pages)
  - migrate to disqus using WP plugin
    - build .csv with urls correspondances
    - disqus > tools > import .csv

#### Code customised in core

- `/` route to our theme pages
- `/tag/:slug` to list of posts tagged _slug_