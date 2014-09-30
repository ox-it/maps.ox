# Oxford Maps

## Using the map on other websites

### Creating custom maps

In order to create a custom map you'll need the identifiers to the points you'd like to include on the map.
These identifiers can be found from the URL within maps.ox, for example [Christ Church](http://ox-it.github.io/maps.ox/#/places/oxpoints:23232352) has the URL `/#/places/oxpoints:23232352`.
Therefore the identifier is `oxpoints:23232352`. Now if we want to create a custom map with Christ Church and George and Danvers's on St. Aldates
(identifier `osm:553028844`) we'd use the following path.

> /#/custom?ids=oxpoints:23232352,osm:553028844

Identifiers should be separated by a comma if you have more than one POI in your map.

The browse pane (on the left) can be removed leaving a fullscreen map with the fullscreen paramater.

> /#/custom?ids=oxpoints:23232352,osm:553028844&fullscreen

[Example embedded maps](examples/custom.html)

### Embedding a map

You can embed a map in your website using an iframe. You need to use the page `//maps.ox.ac.uk/embed.html`.
It is recommended to use a [protocol-relative URL](http://www.paulirish.com/2010/the-protocol-relative-url/) to ensure that the map will be displayed over http/https.


The following iframe embeds a custom map including the different locations of IT Services.

    <iframe src="//maps.ox.ac.uk/embed.html#/custom?ids=oxpoints:40002001,oxpoints:23233672,oxpoints:23233665,oxpoints:55329098,oxpoints:23233636" style="width: 100%; height: 500px;"></iframe>

## Development

### Git

We are using [`git subtree`](https://github.com/git/git/blob/master/contrib/subtree/git-subtree.txt)
to embed the [Mobile Oxford](https://github.com/ox-it/moxie-js-client) git repository at
app/libs/moxiejs.

To work with the subtree merge strategy we recommend installing
[git-subtree](https://github.com/git/git/blob/master/contrib/subtree/git-subtree.txt) and reading up
on [how it works](http://blogs.atlassian.com/2013/05/alternatives-to-git-submodule-git-subtree/).

**Useful commands:**

Add `moxie-js-client` as a remote

    git remote add -f moxiejs git@github.com:ox-it/moxie-js-client.git

Push changes from the subtree to the remote (on branch `maps-ox-changes`)

    git subtree pull --prefix app/libs/moxiejs moxiejs maps-ox-changes

Merge changes from the remote to the subtree (on branch `maps-ox-changes`)

    git subtree merge --prefix app/libs/moxiejs moxiejs/maps-ox-changes --squash


### Publishing to github.io

Here's a useful git alias for merging master, building css and pushing to the `gh-pages` branch.

    publish = !sh -c 'git checkout gh-pages && git merge "$0" && bundle exec compass compile --force && git add -f css/app.css && git commit -m \"updated css\" && git push origin gh-pages'
