Oxford Maps / TileMill
======================

This directory contains files for generating tiles with TileMill.

Structure:
* project.mml: configuration of the project in TileMill
* style/: actual stylesheets
* data/university.json: full GeoJSON feed of departments, colleges, halls, museums and buildings from our API
* data/curated_sites.json: GeoJSON feed containing an arbitrary list of sites to be displayed in higher zoom levels

This project is using the base template osm-bright (see https://www.mapbox.com/tilemill/docs/guides/osm-bright-mac-quickstart/ and https://github.com/mapbox/osm-bright).

Expected layers specific to the university
------------------------------------------

    #university-shapes
    
    #curated-shapes

    #university-labels
    
    #curated-labels
    