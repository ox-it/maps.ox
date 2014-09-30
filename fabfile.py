import os
from datetime import datetime

from fabric.api import *
from fabric.contrib import *
from fabric.contrib.files import exists, sed
from fabric import utils

MAPS_CLIENT_REPO = "git://github.com/ox-it/maps.ox.git"

env.user = 'maps'
env.remote_install_dir_front = '/srv/maps/maps-front'
env.remote_git_checkout_front = '/srv/maps/source-maps-js'

@task
def deploy_front(version):
    """
    Deploy the front-end in a versioned folder and does a symlink
    """

    if not version:
        utils.abort('You must specify a version (whether branch or tag).')

    git_hash = git_branch(env.remote_git_checkout_front, MAPS_CLIENT_REPO, version)
    versioned_path = '/srv/%s/client-%s-%s' % (env.user, datetime.now().strftime('%Y%m%d%H%M'), git_hash)
    run('mkdir {0}'.format(versioned_path))
    run('cp -R {0}/* {1}'.format(env.remote_git_checkout_front, versioned_path))

    with(cd(versioned_path)):
        run('compass compile -e production --force')
        run('r.js -o app/moxie.build.js')
        # adding the URL of the git repo for the JS client as the first line of the built file
        run("sed -i '1s/^/\/\/ https:\/\/github.com\/ox-it\/maps.ox\\n/' app/main-built.js")
        sed("index-prod.html", "\{\{build\}\}", git_hash)
        sed("embed-prod.html", "\{\{build\}\}", git_hash)
        FILES = [
            ('{path}/app/main-built.js', '{path}/app/main-built-{version}.js'),
            ('{path}/css/app.css', '{path}/css/app-{version}.css'),
            ('{path}/css/leaflet.css', '{path}/css/leaflet-{version}.css'),
            ('{path}/css/leaflet.ie.css', '{path}/css/leaflet.ie-{version}.css')
        ]
        for file in FILES:
            run('ln -s %s %s' % (file[0].format(path=versioned_path),
                                 file[1].format(path=versioned_path, version=git_hash)))

        run('rm -f index.html')
        run('ln -s %s %s' % ('index-prod.html', 'index.html'))
        run('rm -f embed.html')
        run('ln -s %s %s' % ('embed-prod.html', 'embed.html'))

    # Pre GZip static (html, css, js) files
    run('sh {0}/gzip_static_files.sh {1}'.format(
        env.remote_git_checkout_front, versioned_path))
    run('rm -f %s' % env.remote_install_dir_front)
    run('ln -s %s %s' % (versioned_path, env.remote_install_dir_front))

def git_branch(git_checkout, git_repo, name):
    """
    Do a checkout on a branch
    """
    if not exists(git_checkout):
        run('git clone %s %s' % (git_repo, git_checkout))

    with cd(git_checkout):
        run('git fetch origin')
        run('git checkout origin/%s' % name)
        run('git submodule update --init')
        return run('git rev-parse --short HEAD')
