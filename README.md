Oxford Maps
===========

An in-development project to produce a mapping application for the University.

Git
---

We are using [`git subtree`](https://github.com/git/git/blob/master/contrib/subtree/git-subtree.txt)
embed [Mobile Oxford](https://github.com/ox-it/moxie-js-client) entire git repository at
app/libs/moxiejs.

To work with the subtree merge strategy I strongly recommend installing
[git-subtree](https://github.com/git/git/blob/master/contrib/subtree/git-subtree.txt) and reading up
on [how it works](http://blogs.atlassian.com/2013/05/alternatives-to-git-submodule-git-subtree/).

**Useful commands:**

Add `moxie-js-client` as a remote

    git remote add -f moxiejs git@github.com:ox-it/moxie-js-client.git

Push changes from the subtree to the remote (on branch `maps-ox-changes`)

    git subtree pull --prefix app/libs/moxiejs moxiejs maps-ox-changes

Merge changes from the remote to the subtree (on branch `maps-ox-changes`)

    git subtree merge --prefix app/libs/moxiejs moxiejs/maps-ox-changes --squash


Publishing to github.io
-----------------------

Here's a useful git alias for merging master, building css and pushing to the `gh-pages` branch.

    publish = !sh -c 'git checkout gh-pages && git merge "$0" && bundle exec compass compile --force && git add -f css/app.css && git commit -m \"updated css\" && git push origin gh-pages'
