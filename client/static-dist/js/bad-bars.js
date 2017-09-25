function get_text_len(txt, font) {
    this.element = document.createElement('canvas');
    this.context = this.element.getContext("2d");
    this.context.font = font;
    return this.context.measureText(txt).width;
}

function BadBars() {
	var width, height;
  
  function chart(selection){
  	selection.each(function(data) {
      var longest = ""
    	var data = Object.keys(data).map(function(key) {
      	if (key.length > longest.length){	longest = key }
        return {name: key, value: data[key]};
      });
      data.sort(function(a, b) { return a.value - b.value; });
      var margin_x =  get_text_len(longest, "12px Arial") + 16;
      height = 26 * data.length;
    	var x = d3.scaleLinear().range([0, width - 50]);
			var y = d3.scaleBand().range([height, 0]);
      
    	var svg = selection.append('svg')
        .attr('width', width + margin_x)
        .attr('height', height);
      var g = svg.append('g')
        .attr('transform', 'translate(' + (margin_x) + ',' + (0) + ')');
     
      x.domain([0, d3.max(data, function(d) { return d.value; })]);
	    y.domain(data.map(function(d) { return d.name; })).padding(0.35);
      g.append("g").attr("class", "y axis").call(d3.axisLeft(y));
      g.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("y", function(d) { return y(d.name); })
        .attr("width", function(d) { return x(d.value); })
        .attr("fill", "#ff5722");
      g.append("g").attr("class", "bar-labels").selectAll("text").data(data).enter().append("text")
      	.text(function(d) { return d.value + "%"; })
        .attr("fill", "#999")
        .attr("dy", "0.98em")
        .attr('font-family', 'Arial')
        .attr('font-size', '0.8em')
        .attr('transform', function(d) { return 'translate(' + (x(d.value) + 4) + "," + y(d.name) + ")"; });
        
        /* Apply missing styles to avoid css */
        g.selectAll(".axis text").attr("font-size", "12px");
        g.selectAll(".axis line")
          .attr("stroke-width", "1px")
          .attr("stroke", "#D4D8DA");
        g.selectAll(".axis path")
          .attr("fill", "none")
          .attr("stroke", "none");
      
    });
  }
  
  // Getters and Setters
  chart.width = function(value) { if (!arguments.length) return width; width = value; return chart; };
  chart.height = function(value) { if (!arguments.length) return height; height = value; return chart; };
  return chart;
}
