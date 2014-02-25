#osm[type='motorway'][zoom>9],
#osm[type='trunk'][zoom>9] {
  text-name:"[name]";
  text-face-name:@font;
  text-placement:line;
  text-fill:#777;
  //text-halo-fill:@road_halo;
  text-halo-radius:1;
  text-min-distance:60;
  text-size:10;
  [zoom=11] { text-min-distance:70; }
  [zoom=12] { text-min-distance:80; }
  [zoom=13] { text-min-distance:100; }
}

#osm[type='primary'][zoom>12],
#osm[type='secondary'][zoom>13],
#osm[type='tertiary'][zoom>13] {
  text-name:'[name]';
  text-face-name:@font;
  text-placement:line;
  text-fill:#777;
  //text-halo-fill:@road_halo;
  text-halo-radius:1;
  text-min-distance:60;
  text-size:11;
}

#osm[zoom>16] {
  text-name:'[name]';
  text-face-name:@font;
  text-placement:line;
  text-size:9;
  text-fill:#777;
  //text-halo-fill:@road_halo;
  text-halo-radius:1;
  text-min-distance:60;
  text-size:11;
}
