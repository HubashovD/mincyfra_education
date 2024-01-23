(function () {
  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width =
      d3.select("#line_chart").node().getBoundingClientRect().width -
      margin.left -
      margin.right,
    height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .select("#line_chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var parseTime = d3.timeParse("%Y-%m");

  //Read the data
  d3.csv("data/line_chart.csv").then(function (data) {
    // format the data
    data.forEach(function (d) {
      d.date_start = parseTime(d.date_start);
      d.ide = +d.ide;
    });

    // List of groups (here I have one group per column)
    var allGroup = d3
      .map(data, function (d) {
        return d.sphere_detailed;
      })
      .keys();

    // add the options to the button
    d3.select("#selectButton")
      .selectAll("myOptions")
      .data(allGroup)
      .enter()
      .append("option")
      .text(function (d) {
        return d;
      }) // text showed in the menu
      .attr("value", function (d) {
        return d;
      }); // corresponding value returned by the button

    // A color scale: one color for each group
    var myColor = d3
      .scaleOrdinal()
      .domain(["Заплановано", "Проведено", "Не проведено"])
      .range(["purple", "green", "red"]);

    // Add X axis --> it is a date format
    var x = d3
      .scaleTime()
      .domain(
        d3.extent(data, function (d) {
          return d.date_start;
        })
      )
      .range([0, width]);
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(window.innerWidth / 150));

    var testFilter = data.filter(function (d) {
      return d.sphere_detailed == allGroup[0];
    });

    // Add Y axis
    var y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(testFilter, function (d) {
          return +d.ide;
        }),
      ])
      .range([height, 0]);

    // gridlines in x axis function
    function make_x_gridlines() {
      return d3.axisBottom(x).ticks(5);
    }

    // gridlines in y axis function
    function make_y_gridlines() {
      return d3.axisLeft(y).ticks(5);
    }

    // add the X gridlines
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .call(make_x_gridlines().tickSize(-height).tickFormat(""));

    // add the Y gridlines
    svg
      .append("g")
      .attr("class", "grid")
      .call(make_y_gridlines().tickSize(-width).tickFormat(""));

    svg.append("g").attr("class", "myYaxis").call(d3.axisLeft(y));

    var sumstat = d3
      .nest() // nest function allows to group the calculation per level of a factor
      .key(function (d) {
        return d.status;
      })
      .entries(testFilter);

    var group = svg
      .selectAll(".group")
      .data(sumstat)
      .enter()
      .append("g")
      .attr("class", "group");

    var linepath = d3
      .line()
      .x(function (d) {
        return x(d.date_start);
      })
      .y(function (d) {
        return y(d.ide);
      });

    group
      .append("path")
      .attr("class", "line")
      .attr("d", function (d) {
        return linepath(d.values);
      })
      .attr("fill", "none")
      .style("stroke", function (d) {
        return myColor(d.key);
      });

    // A function that update the chart
    function update(selectedGroup) {
      var linepath = d3
        .line()
        .x(function (d) {
          return x(d.date_start);
        })
        .y(function (d) {
          return y(d.ide);
        });

      // Create new data with the selection?
      var dataFilter = data.filter(function (d) {
        return d.sphere_detailed == selectedGroup;
      });

      sumstat = d3
        .nest() // nest function allows to group the calculation per level of a factor
        .key(function (d) {
          return d.status;
        })
        .entries(dataFilter);

      // create the Y axis
      y.domain([
        0,
        d3.max(dataFilter, function (d) {
          return d.ide;
        }),
      ]);

      svg.selectAll(".myYaxis").transition().duration(500).call(d3.axisLeft(y));

      svg.selectAll(".group").remove();

      var group = svg
        .selectAll(".group")
        .data(sumstat)
        .enter()
        .append("g")
        .attr("class", "group");

      group
        .append("path")
        .attr("class", "line")
        .attr("d", function (d) {
          return linepath(d.values);
        })
        .attr("fill", "none")
        .style("stroke", function (d) {
          return myColor(d.key);
        });
    }

    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function (d) {
      // recover the option that has been chosen
      var selectedOption = d3.select(this).property("value");
      // run the updateChart function with this selected option
      update(selectedOption);
    });
  });
})();
