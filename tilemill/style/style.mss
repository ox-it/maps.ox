// see reference https://www.mapbox.com/carto/api/2.1.0/

Map {
  background-color: #b8dee6;
}

#countries {
  ::outline {
    line-color: #85c5d3;
    line-width: 2;
    line-join: round;
  }
  polygon-fill: #fff;
}

/*#osm {
  line-width: 1;
  line-color: #85c5d3;  
}*/

/* Road width variables that are used in road & bridge styles */
@rdz11_maj: 1.6; @rdz11_med: 0.8; @rdz11_min: 0.4;
@rdz12_maj: 2.5; @rdz12_med: 1.2; @rdz12_min: 0.8;
@rdz13_maj: 3;   @rdz13_med: 1.5; @rdz13_min: 1;
@rdz14_maj: 4;   @rdz14_med: 2.5; @rdz14_min: 1.6;
@rdz15_maj: 6;   @rdz15_med: 4;   @rdz15_min: 2;
@rdz16_maj: 8;   @rdz16_med: 6;   @rdz16_min: 4;
@rdz17_maj: 14;  @rdz17_med: 12;  @rdz17_min: 10;
@rdz18_maj: 20;  @rdz18_med: 17;  @rdz18_min: 14;

@land:              #FCFBE7;
@water:             #C4DFF6;
@grass:             #E6F2C1;
@beach:             #FFEEC7;
@park:              #DAF2C1;
@cemetery:          #D6DED2;
@wooded:            #C3D9AD;
@agriculture:       #F2E8B6;

@building:          #E4E0E0;
@hospital:          rgb(229,198,195);
@school:            #FFF5CC;
@sports:            #B8E6B8;

@residential:       @land * 0.98;
@commercial:        @land * 0.97;
@industrial:        @land * 0.96;
@parking:           #EEE;

@motorway_line:     #E65C5C;
@motorway_fill:     lighten(@motorway_line,10%);
@motorway_case:     @motorway_line * 0.9;

@trunk_line:        #E68A5C;
@trunk_fill:        lighten(@trunk_line,10%);
@trunk_case:        @trunk_line * 0.9;

@primary_line:      #FFC859;
@primary_fill:      lighten(@primary_line,10%);
@primary_case:      @primary_line * 0.9;

@secondary_line:    #FFE873;
@secondary_fill:    lighten(@secondary_line,10%);
@secondary_case:    @secondary_line * 0.9;

@standard_line:     @land * 0.85;
@standard_fill:     #fff;
@standard_case:     @land * 0.9;

@pedestrian_line:   @standard_line;
@pedestrian_fill:   #FAFAF5;
@pedestrian_case:   @land;

@cycle_line:        @standard_line;
@cycle_fill:        #FAFAF5;
@cycle_case:        @land;

@rail_line:         #999;
@rail_fill:         #fff;
@rail_case:         @land;

#osm[zoom>=5][zoom<=8] {
  [type='motorway'] { line-color: @motorway_line; }
  [type='trunk'] { line-color: @trunk_line; }
  [zoom=5] {
    [type='motorway'] { line-width: 0.4; }
    [type='trunk'] { line-width: 0.2; } }
  [zoom=6] {
    [type='motorway'] { line-width: 0.5; }
    [type='trunk'] { line-width: 0.25; } }
  [zoom=7] {
    [type='motorway'] { line-width: 0.6; }
    [type='trunk'] { line-width: 0.3; } }
  [zoom=8] {
    [type='motorway'] { line-width: 1; }
    [type='trunk'] { line-width: 0.5; } }
}

#osm[zoom>=9][zoom<=10] {
  [type='motorway'],
  [type='motorway_link'] {
    line-color: @motorway_line;
  }
  [type='trunk'],
  [type='trunk_link'] {
    line-color: @trunk_line;
  }
  [type='primary'] { line-color: @primary_line; }
  [type='secondary'] { line-color: @secondary_line; }
  [type='tertiary'] { line-color: @standard_line; }
  [zoom=9] {
    [type='motorway'],[type='trunk'] { line-width: 1.4; }
    [type='primary'],[type='secondary'],
    [type='motorway_link'],[type='trunk_link'] { line-width: 0.6; }
  }
  [zoom=10] {
    [type='motorway'],[type='trunk'] { line-width: 1.8; }
    [type='primary'],[type='secondary'],
    [type='motorway_link'],[type='trunk_link'] { line-width: 0.8; }
  }
}

#osm[zoom>=11][zoom<=20] {
  /* -- colors & styles -- */
  line-color: #777;
  [type='motorway'],
  [type='motorway_link'] {
    line-color: @motorway_fill;
    [tunnel=1] { line-color: lighten(@motorway_fill, 10%); }
  }
  [type='trunk'],
  [type='trunk_link'] {
    line-color: @trunk_fill;
    [tunnel=1] { line-color: lighten(@trunk_fill, 10%); }
  }
  [type='primary'],
  [type='primary_link'] {
    line-color: @primary_fill;
    [tunnel=1] { line-color: lighten(@primary_fill, 10%); }
  }
  [type='secondary'],
  [type='secondary_link'] {
    line-color: @secondary_fill;
    [tunnel=1] { line-color: lighten(@secondary_fill, 10%); }
  }
  [type='railway'] {
    line-color: @rail_line;
    line-dasharray: 1,1;
    [type='subway'] { line-opacity: 0.67; }
    [zoom>15] { line-dasharray: 1,2; } 
  }
  [type='noauto'],
  [type='service'],
  [type='minorroad'] {
    line-width: 0;
  }
  [type='service'],
  [type='minorroad'],
  [type='mainroad'],
  [type='motorway'] {
    line-cap: round;
    line-join: round;
  }
  [type='noauto'] {
    line-join: round;
  }
  [tunnel=1] {
    line-cap: butt;
  }
  /* -- widths -- */
  [zoom=11] {
    [type='motorway'] { line-width: @rdz11_maj; }
    [type='mainroad'] { line-width: @rdz11_med; }
    [type='minorroad']{ line-width: 0; }
    [type='railway']  { line-width: 0.2; }
  }
  [zoom=12] {
    [type='motorway'] { line-width: @rdz12_maj; }
    [type='mainroad'] { line-width: @rdz12_med; }
    [type='minorroad']{ line-width: 0; }
    [type='railway']  { line-width: 0.4; }
  }
  [zoom=13] {
    [type='motorway'] { line-width: @rdz13_maj; }
    [type='mainroad'] { line-width: @rdz13_med; }
    [type='minorroad']{ line-width: @rdz13_min; }
    [type='service']  { line-width: @rdz13_min / 3; }
    [type='noauto']   { line-width: @rdz13_min / 4; line-dasharray: 1,1; }
    [type='railway']  { line-width: 0.8; }
  }
  [zoom=14] {
    [type='motorway'] { line-width: @rdz14_maj; }
    [type='mainroad'] { line-width: @rdz14_med; }
    [type='minorroad']{ line-width: @rdz14_min; }
    [type='service']  { line-width: @rdz14_min / 3; }
    [type='noauto']   { line-width: @rdz14_min / 4; line-dasharray: 1,1; }
    [type='railway']  { line-width: 1; }
  }
  [zoom=15] {
    [type='motorway'] { line-width: @rdz15_maj; }
    [type='mainroad'] { line-width: @rdz15_med; }
    [type='minorroad']{ line-width: @rdz15_min; }
    [type='service']  { line-width: @rdz15_min / 3; }
    [type='noauto']   { line-width: @rdz15_min / 4; line-dasharray: 1,1; }
    [type='railway']  { line-width: 1.5; }
  }
  [zoom=16] {
    [type='motorway'] { line-width: @rdz16_maj; }
    [type='mainroad'] { line-width: @rdz16_med; }
    [type='minorroad']{ line-width: @rdz16_min; }
    [type='service']  { line-width: @rdz16_min / 3; }
    [type='noauto']   { line-width: @rdz16_min / 4; line-dasharray: 2,1; }
    [type='railway']  { line-width: 2; }
  }
  [zoom=17] {
    [type='motorway'] { line-width: @rdz17_maj; }
    [type='mainroad'] { line-width: @rdz17_med; }
    [type='minorroad']{ line-width: @rdz17_min; }
    [type='service']  { line-width: @rdz17_min / 3; }
    [type='noauto']   { line-width: @rdz17_min / 4; line-dasharray: 2,2; }
    [type='railway']  { line-width: 3; }
  }
  [zoom>=18] {
    [type='motorway'] { line-width: @rdz18_maj; }
    [type='mainroad'] { line-width: @rdz18_med; }
    [type='minorroad']{ line-width: @rdz18_min; }
    [type='service']  { line-width: @rdz18_min / 2; }
    [type='noauto']   { line-width: @rdz18_min / 4; line-dasharray: 3,3; }
    [type='railway']  { line-width: 4; }
  }
}


