@oxfordblue: #002147;
@font: "Helvetica Neue Bold";
@value: [short_name];

#university {
  [zoom>=16] {
    ::outline {
      line-color: black;
      line-width: 1;
      line-join: round;
      }
  }
  [zoom>=16] [type_name = "Building"] {
	::polygon {
    	polygon-opacity: 90;
    	polygon-fill: @oxfordblue; 
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
