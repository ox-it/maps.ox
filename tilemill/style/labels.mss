@oxfordblue: #002147;
@font: "Helvetica Neue Bold";
@value: [short_name];

#university-labels {
  [zoom>=16] {
    ::labels {
      text-face-name: @font;
      text-name: @value;
      //text-fill: #036;
      text-size: 15;
      text-halo-fill: fadeout(white, 30%);
      text-halo-radius: 2.5;
      text-placement: point;
      text-placement-type: simple;  	// Re-position and/or re-size text to avoid overlaps
      text-placements: "N,S,E,W,NE,SE,NW,SW,16,14,12";
      text-max-char-angle-delta: 15;
      text-wrap-width: 25;
      [type_name = "College"] { 
        text-fill: red;
      }
      [type_name = "Hall"] { 
        text-fill: red;
      }
      [type_name = "Library"] { 
        text-fill: green;
      }
      [type_name = "Department"] { 
        text-fill: orange;
      }
      [type_name = "Museum"] { 
        text-fill: blue;
      }
    }
  }
  [zoom<=15] [type_name = "Site"] {
  	::labels {
      text-face-name: @font;
      text-name: @value;
      text-fill: green;
      text-size: 15;
      text-halo-fill: fadeout(white, 30%);
      text-halo-radius: 2.5;
      text-placement: point;
      text-placement-type: simple;  	// Re-position and/or re-size text to avoid overlaps
      text-placements: "N,S,E,W,NE,SE,NW,SW,16,14,12";
      text-max-char-angle-delta: 15;
      text-wrap-width: 25;
    }
  }
}
