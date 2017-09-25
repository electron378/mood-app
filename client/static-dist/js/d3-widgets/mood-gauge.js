function MoodGauge() {
  var width, height, title,
    margin = { top: 10, right: 4, bottom: 4, left: 4 },
    colors= {opt4:"#ff5722", opt3:"#ffc107", opt2:"#ffeb3b", opt1:"#4caf50", None:"#dedede" };

  function chart(selection) {
    selection.each(function(data) {
      var radius = Math.min(width / 2, height);
      var pie = d3.pie().sort(null)
        .value(function(d) { return d.val; })
        .startAngle(-90 * (Math.PI / 180))
        .endAngle(90 * (Math.PI / 180));
      var arc = d3.arc().outerRadius(radius * 0.75).innerRadius(radius * 0.5)
        .cornerRadius(2).padAngle(0.025);
      var outerArc = d3.arc().outerRadius(radius * 0.9).innerRadius(radius * 0.9);
      var labelArc = d3.arc().outerRadius(radius * 1.0).innerRadius(radius * 1.0);
      var borderArc = d3.arc().outerRadius(radius * 0.8).innerRadius(radius * 0.8);
      var svg = selection.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + (width/2 + margin.left) + ',' + (height + margin.top) + ')');
      
      /* add groups */
      svg.append('g').attr('class', 'slices');
      svg.append('g').attr('class', 'labelName');
      svg.append('g').attr('class', 'lines');
      svg.append('g').attr('class', 'title');
      
      /* add title */
      svg.select('.title').append('text')
      .attr('font-size', '1.6em')
        .attr('fill', '#999')
        .attr('font-family', 'Arial')
        .attr('text-anchor', 'middle')
        .attr('dy', '-.3em')
        .attr('transform', 'translate(' + (0) + ',' + (0) + ')')
        .text(title);
      
      /* add slices and set colors */
      var path = svg.select('.slices')
        .datum(data).selectAll('path')
        .data(pie)
        .enter().append('path')
          .attr('fill', function(d) { return colors[d.data.name]; })
          .attr('d', arc);
      
      /* add labels (%s) */
      var label = svg.select('.labelName').selectAll('text')
        .data(pie)
        .enter().append('text')
        .attr('dy', '.35em')
        .attr('font-family', 'Arial')
        .attr('font-size', '0.8em')
        .attr('fill', function(d) { return colors[d.data.name]; })
        .attr('text-anchor', 'middle')
        .attr('transform', function(d) { return 'translate(' + labelArc.centroid(d) + ')'; })
        .text(function(d) { return d.data.val.toFixed(0) + "%"; })

      /* add lines to connect slices with labels */
      var polyline = svg.select('.lines')
        .selectAll('polyline')
        .data(pie)
        .enter().append('polyline')
        .attr('stroke', '#aaa')
        .attr('fill', 'none')
        .attr('stroke-width', '2px')
        .attr('points', function(d) { return [borderArc.centroid(d), outerArc.centroid(d)] });
    });
  }

  // Getters and Setters
  chart.width = function(value) { if (!arguments.length) return width; width = value; return chart; };
  chart.height = function(value) { if (!arguments.length) return height; height = value; return chart; };
  chart.colors = function(value) { if (!arguments.length) return colors; colors = value; return chart; };
  chart.title = function(value) { if (!arguments.length) return title; title = value; return chart; };
  return chart;
}
