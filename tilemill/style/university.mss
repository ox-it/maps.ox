@oxfordblue: #002147;
@font: "Helvetica Neue Bold";
@value: [short_name];

#university-shapes {
  [zoom>=16] {
    [type_name = "College"],
    [type_name = "Hall"] {
      ::polygon {
          polygon-opacity: 0.2;
          polygon-fill: @oxfordblue; 
      }
      ::outline {
        line-color: black;
        line-width: 2;
        line-join: round;
        }
	}
  }
  [zoom<=15] [type_name = "Site"] {
   ::outline {
      line-color: black;
      line-width: 1;
      line-join: round;
	}
	::shape {
    	polygon-fill: @oxfordblue; 
  	}
  }
}

#university-labels {
  [zoom>=16] {
    [type_name = "College"],
    [type_name = "Department"],
    [type_name = "Hall"] {
      ::labels {
        text-face-name: @font;
        text-name: @value;
        text-fill: @oxfordblue;
        text-size: 12;
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
  [zoom<=15] [type_name = "Site"] {
  	::labels {
      text-face-name: @font;
      text-name: @value;
      text-fill: black;
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
