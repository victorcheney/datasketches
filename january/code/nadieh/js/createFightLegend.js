function createFightLegend() {
	
	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Set up the SVG ///////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Fixed size for the circles
	var baseRadius = 5,
		backgroundCircleFactor = 7, //How many times the baseRadius should the background circle become
		baseDistanceRatio = 0.7, //The default distance that the circles are apart
		scaleIncrease = 3;		

	var margin = {
	  top: 10,
	  right: 10,
	  bottom: 10,
	  left: 10
	};
	var width = document.getElementById("fight-legend").clientWidth - 2*15 - margin.left - margin.right;
	var height = 2*baseRadius*backgroundCircleFactor * 1.5; //2*baseRadius*backgroundCircleFactor * scaleIncrease * 1.1;
		
	//SVG container
	var svg = d3.select('#fight-legend')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + (margin.left + width/2) + "," + (margin.top + height/2) + ")");

	///////////////////////////////////////////////////////////////////////////
	/////////////////////////// Create the dummy data /////////////////////////
	///////////////////////////////////////////////////////////////////////////

	var data = [
		{character: "Goku", color: "#f27c07"},
		{character: "Vegeta", color: "#1D75AD"},
	];
	var numFighters = data.length;

	///////////////////////////////////////////////////////////////////////////
	/////////////////////////////// Add text //////////////////////////////////
	///////////////////////////////////////////////////////////////////////////


	var aFight = svg.append("text")
		.attr("class","fight-legend-text")
		.attr("x", 0)
		.attr("y", -baseRadius*backgroundCircleFactor*scaleIncrease * 0.3)
		.attr("dy", "0.3em")
		.text("1 fight");

	///////////////////////////////////////////////////////////////////////////
	///////////////////////// Create a group per fight ////////////////////////
	///////////////////////////////////////////////////////////////////////////

	var fightWrapper = svg.append("g").attr("class", "fight-wrapper-legend");

	//Inner fight wrapper that can be scaled on hover
	var fight = fightWrapper.append("g")
		.attr("class", "fight-legend")
		.style("isolation", "isolate");

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Create the circles per character /////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Extra background that becomes visible on hover
	var fightCircleBackground = fight.append("circle")
		.attr("class", "fight-background-circle-legend")
		.attr("r", baseRadius*backgroundCircleFactor)
		.style("opacity", 0);

	//Create circles for fighters
	fight.selectAll(".character-circle-legend")
		.data(data)
		.enter().append("circle")
		.attr("class","character-circle-legend")
		.attr("transform", function(d,i) { 
			var x = -baseRadius*baseDistanceRatio * (i === 0 ? 1 : -1);
			return "translate(" + x + "," + 0 + ")"; 
		})
		.attr("r", baseRadius)
		.style("fill", function(d) { return d.color; });

	//Add text for fighters
	fight.selectAll(".fight-legend-circle-text")
		.data(data)
		.enter().append("text")
		.attr("class","fight-legend-circle-text")
		.attr("transform", function(d,i) { 
			var x = -baseRadius*baseDistanceRatio * (i === 0 ? 1 : -1);
			return "translate(" + x + "," + 0 + ")"; 
		})
		.attr("dy", "-1.75em")
		.style("fill", function(d) { return d.color; })
		.style("opacity", 0)
		.text(function(d) { return d.character; });	


	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Animation functions /////////////////////////
	///////////////////////////////////////////////////////////////////////////

	runLegend();
	var t = d3.interval(runLegend, 5000);

	function runLegend() {
	  animateLegendOutward();
	  setTimeout(animateLegendInward, 2500);
	}//runLegend

	function animateLegendOutward() {

		//Make the fight elements bigger
		fight
			.transition("grow").duration(750)
			.attr("transform", "scale(" + scaleIncrease + ")");

		//Move the circles & titles apart
		fight.selectAll(".character-circle-legend, .fight-legend-circle-text")
			.transition("move").duration(1000)
			.attr("transform", function(d,i) { 
				var x = -baseRadius*3 * (i%2 === 0 ? 1 : -1);
				return "translate(" + x + "," + 0 + ")"; 
			});

		//Make the background circle visible
		fight.select(".fight-background-circle-legend")
			.style("filter", "url(#shadow)")
			.transition().duration(1000)
			.style("opacity", 1);

		//Make character title visible
		fight.selectAll(".fight-legend-circle-text")
			.transition("fade").duration(1000)
			.style("opacity", 1);

	}//function animateLegend

	function animateLegendInward() {

		//Return to the normal scale
		fight
			.transition("grow").duration(750)
			.attr("transform", "scale(1)");

		//Move circles back together
		fight.selectAll(".character-circle-legend, .fight-legend-circle-text")
			.transition("move").duration(750)
			.attr("transform", function(d,i) { 
				var x = -baseRadius*baseDistanceRatio * (i%2 === 0 ? 1 : -1)
				return "translate(" + x + "," + 0 + ")"; 
			});

		//Hide the background circle
		fight.select(".fight-background-circle-legend")
			.transition().duration(750)
			.style("opacity", 0)
			.on("end", function() { d3.select(this).style("filter", null); });

		//Hide fighter names
		fight.selectAll(".fight-legend-circle-text")
			.transition("fade").duration(450)
			.style("opacity", 0);

	}//function animateLegend


}//function createFightLegend