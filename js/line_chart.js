Promise.all([d3.csv("data/educators_pivoted.csv")]).then(function (input) {
  var parseDate = d3.timeParse("%Y-%m-%d");

  var bisect = d3.bisector(function (d) {
    return d.date;
  }).left;

  var color = d3.scaleOrdinal(d3.schemeCategory10);

  input[0].forEach(function (d) {
    d.budget = +d.budget;
    d.contract = +d.contract;
    d.date = parseDate(d.date);
  });

  var maxDate = d3.max(input[0], function (d) {
    return d.date;
  });

  // Получение уникальных значений для списков
  let levels = Array.from(new Set(input[0].map((d) => d.level))).sort();

  // Налаштування фільтрів
  var default_level = "Бакалавр";

  d3.select("#select-list-1")
    .select("ul")
    .selectAll("li.auto-added")
    .data(levels)
    .enter()
    .append("li")
    .attr("class", "auto-added")
    .text(function (d) {
      return d;
    });

  d3.select("#select-list-1").on("click", function () {
    let dropdown = d3.select(this.parentNode).select("ul.dropdown");
    dropdown.classed("hidden", !dropdown.classed("hidden"));
  });


  var margin = { top: 30, right: 150, bottom: 30, left: 50 },
    width =
      d3.select("#chart-1").node().getBoundingClientRect().width -
      margin.left -
      margin.right,
    height = 700 - 50 - margin.top - margin.bottom,
    singleHeight = (height - 50) / 2;

  // Створення графіку

  function initializeCharts(input, margin, width, singleHeight) {
    var x = d3.scaleTime().range([0, width]),
      y1 = d3.scaleLinear().range([singleHeight, 0]),
      y2 = d3.scaleLinear().range([singleHeight, 0]);

    var xAxis = d3
        .axisBottom(x)
        .ticks(10)
        .tickFormat(multiFormat)
        .tickSize(-singleHeight),
      yAxisLeft = d3
        .axisLeft(y1)
        .ticks(5)
        .tickFormat(nFormatter)
        .tickSize(-width),
      yAxisRight = d3
        .axisLeft(y2)
        .ticks(5)
        .tickFormat(nFormatter)
        .tickSize(-width);

    var svg = d3
      .select("#chart-1")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    var first_chart = svg
      .append("g")
      .attr("class", "first_chart")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // first_chart
    //   .append("g")
    //   .attr("class", "grid")
    //   .attr("transform", "translate(0," + singleHeight + ")")
    //   .call(xAxis);

    var second_chart = svg
      .append("g")
      .attr("class", "second_chart")
      .attr(
        "transform",
        "translate(" +
          margin.left +
          "," +
          (margin.top + singleHeight + 50) +
          ")"
      );

    var init_data = input[0].filter((d) => d.level == "Бакалавр");

    x.domain(d3.extent(init_data, (d) => d.date));
    y1.domain([0, d3.max(init_data, (d) => d.budget)]);
    y2.domain([0, d3.max(init_data, (d) => d.contract)]);

    // Закоментуйте або видаліть наступний рядок, щоб прибрати ось X з першого графіка
    first_chart
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + singleHeight + ")")
      .call(xAxis);

    second_chart
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + singleHeight + ")")
      .call(xAxis);

    first_chart.append("g").attr("class", "y axis").call(yAxisLeft);
    second_chart.append("g").attr("class", "y axis").call(yAxisRight);

    return {
      x,
      y1,
      y2,
      first_chart,
      second_chart,
      init_data,
      xAxis,
      yAxisLeft,
      yAxisRight,
    };
  }

  var chartData = initializeCharts(input, margin, width, singleHeight);

  var x = chartData.x;
  var y1 = chartData.y1;
  var y2 = chartData.y2;
  var first_chart = chartData.first_chart;
  var second_chart = chartData.second_chart;
  var init_data = chartData.init_data;
  var xAxis = chartData.xAxis;
  var yAxisLeft = chartData.yAxisLeft;
  var yAxisRight = chartData.yAxisRight;

  var sumstat = d3
    .nest()
    .key(function (d) {
      return d.base;
    })
    .entries(init_data);

    console.log(sumstat);

  var linepath1 = d3
    .line()
    .x(function (d) {
      return x(d.date);
    })
    .y(function (d) {
      return y1(d.budget);
    });

  var linepath2 = d3
    .line()
    .x(function (d) {
      return x(d.date);
    })
    .y(function (d) {
      return y2(d.contract);
    });

  // Додавання ліній до першого графіку
  // first_chart
  //   .selectAll(".line")
  //   .data(sumstat)
  //   .enter()
  //   .append("path")
  //   .attr("class", "line")
  //   .attr("d", function (d) {
  //     return linepath1(d.values);
  //   })
  //   .attr("fill", "none")
  //   .style("stroke", function (d) {
  //     return color(d.key);
  //   })
  //   .style("stroke-width", "1px");

  // Додавання ліній до другого графіку
  // second_chart
  //   .selectAll(".line")
  //   .data(sumstat)
  //   .enter()
  //   .append("path")
  //   .attr("class", "line")
  //   .attr("d", function (d) {
  //     return linepath2(d.values);
  //   })
  //   .attr("fill", "none")
  //   .style("stroke", function (d) {
  //     return color(d.key);
  //   })
  //   .style("stroke-width", "1px");

  function adjustLabelPosition(labels, labelSpacing) {
    var overlap;
    do {
      overlap = false;
      labels.forEach(function (label, i) {
        for (var j = i + 1; j < labels.length; j++) {
          if (Math.abs(label.y - labels[j].y) < labelSpacing) {
            labels[j].y = label.y + labelSpacing;
            overlap = true;
          }
        }
      });
    } while (overlap);
  }

  function addLabels(
    chart,
    data,
    xScale,
    yScale,
    valueField,
    colorScale,
    labelSpacing
  ) {
    var labels = data.map(function (d) {
      var lastPointIndex = d.values.length - 1;
      var lastPoint = d.values[lastPointIndex];
      return {
        key: d.key,
        x: xScale(maxDate) + 5,
        y: yScale(lastPoint[valueField]),
        color: colorScale(d.key),
      };
    });

    adjustLabelPosition(labels, labelSpacing);

    chart
      .selectAll(".label")
      .data(labels)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      })
      .attr("dy", ".35em")
      .style("fill", function (d) {
        return d.color;
      })
      .text(function (d) {
        return d.key;
      });
  }

  var labelSpacing = 20; // Відстань між підписами

  // Додавання підписів для першого графіка
  addLabels(first_chart, sumstat, x, y1, "budget", color, labelSpacing);

  // Додавання підписів для другого графіка
  addLabels(second_chart, sumstat, x, y2, "contract", color, labelSpacing);

  // CREATE HOVER TOOLTIP WITH VERTICAL LINE //
  tooltip = d3
    .select("#chart-1")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("background-color", "#D3D3D3")
    .style("padding", 6)
    .style("display", "none");


  // Виклик функції для створення інтерактивних ефектів для обох графіків
  // createMouseOverEffects(first_chart, sumstat, x, y1, "budget");
  // createMouseOverEffects(second_chart, sumstat, x, y2, "contract");

  function updateData(level) {
    var filteredData = input[0].filter((d) => d.level === level);

    sumstat = d3
      .nest()
      .key(function (d) {
        return d.base;
      })
      .entries(filteredData);

    x.domain(d3.extent(filteredData, (d) => d.date));
    y1.domain([0, d3.max(filteredData, (d) => d.budget)]);
    y2.domain([0, d3.max(filteredData, (d) => d.contract)]);

    first_chart.selectAll(".x.axis").transition().duration(750).call(xAxis);
    first_chart.selectAll(".y.axis").transition().duration(750).call(yAxisLeft);
    second_chart.selectAll(".x.axis").transition().duration(750).call(xAxis);
    second_chart
      .selectAll(".y.axis")
      .transition()
      .duration(750)
      .call(yAxisRight);

    updateChart(first_chart, sumstat, linepath1, y1, "budget");
    updateChart(second_chart, sumstat, linepath2, y2, "contract");

    // updateTooltips(first_chart, sumstat, x, y1, "budget");
    // updateTooltips(second_chart, sumstat, x, y2, "contract");

    createTooltips(
      first_chart,
      second_chart,
      sumstat,
      x,
      y1,
      y2,
      "budget",
      "contract"
    );

    function updateChart(chart, data, linePath, yScale, valueField) {
      var groups = chart.selectAll(".group").data(data);

      // Remove old elements
      groups.exit().remove();

      // Add new elements
      var newGroups = groups
        .enter()
        .append("g")
        .attr("class", "group");

      newGroups
        .append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .style("stroke-width", "1px");

      newGroups.append("text");


      // Update existing elements
      var allLines = groups.select(".line").merge(newGroups.select(".line"));
      allLines
        .transition()
        .duration(750)
        .attr("d", function (d) {
          return linePath(d.values);
        })
        .style("stroke", function (d) {
          return color(d.key);
        });

      var allTexts = groups.select("text").merge(newGroups.select("text"));
      allTexts
        .transition()
        .duration(750)
        .attr("transform", function (d) {
          var lastPointIndex = d.values.length - 1;
          var lastPoint = d.values[lastPointIndex];
          return (
            "translate(" +
            x(lastPoint.date) +
            "," +
            yScale(lastPoint[valueField]) +
            ")"
          );
        })
        .attr("dy", ".35em")
        .attr("dx", ".35em")
        .style("fill", function (d) {
          return color(d.key);
        })
        .text(function (d) {
          return d.key;
        });
    }
  }

  updateData(default_level)

  function createTooltips(
    first_chart,
    second_chart,
    sumstat,
    xScale,
    y1Scale,
    y2Scale,
    valueField1,
    valueField2
  ) {
    function updateTooltips(
      chart,
      xScale,
      yScale,
      valueField,
      mouseX,
      colorScale
    ) {
      var tooltips = [];

      chart.selectAll(".mouse-per-line").each(function (d) {
        var xDate = xScale.invert(mouseX);
        var idx = bisect(d.values, xDate);
        if (idx >= d.values.length || idx < 0) return;

        var dataPoint = d.values[idx];
        var yPosition = yScale(dataPoint[valueField]);
        var xPosition = mouseX;
        var text = d3.select(this).select("text");

        // Перевірка на накладання
        tooltips.forEach(function (t) {
          if (Math.abs(t.y - yPosition) < 20) {
            // 20 - мінімальна відстань між текстами
            yPosition = t.y < yPosition ? yPosition + 20 : yPosition - 20; // Зсув тексту вгору або вниз
            // xPosition = t.x < xPosition ? xPosition + 20 : xPosition - 20; // Зсув тексту вліво або вправо
          }
          yPosition = yPosition - 7;
        });

        tooltips.push({ x: xPosition, y: yPosition });
        if (dataPoint[valueField] !== 0) {
          text
            .text(dataPoint[valueField])
            .attr("transform", "translate(" + xPosition + "," + yPosition + ")")
            .style("fill", colorScale(d.key)); // Встановлення кольору тексту

          d3.select(this)
            .select("circle")
            .attr(
              "transform",
              "translate(" +
                xScale(dataPoint.date) +
                "," +
                yScale(dataPoint[valueField]) +
                ")"
            );
        }
      });
    }
    // function updateTooltips(chart, xScale, yScale, valueField, mouseX) {
    //   chart.selectAll(".mouse-per-line").attr("transform", function (d) {
    //     var xDate = xScale.invert(mouseX);
    //     var idx = bisect(d.values, xDate);
    //     if (idx >= d.values.length || idx < 0) return;

    //     var dataPoint = d.values[idx];
    //     d3.select(this).select("text").text(dataPoint[valueField]);

    //     return (
    //       "translate(" +
    //       xScale(dataPoint.date) +
    //       "," +
    //       yScale(dataPoint[valueField]) +
    //       ")"
    //     );
    //   });
    // }

    function setupTooltip(chart, data, xScale, yScale, valueField) {
      chart.selectAll(".mouse-over-effects").remove();

      var mouseG = chart.append("g").attr("class", "mouse-over-effects");

      mouseG
        .append("path")
        .attr("class", "mouse-line")
        .style("stroke", "#A9A9A9")
        .style("stroke-width", "1px")
        .style("opacity", "0");

      var mousePerLine = mouseG
        .selectAll(".mouse-per-line")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");

      mousePerLine
        .append("circle")
        .attr("r", 4)
        .style("stroke", function (d) {
          return color(d.key);
        })
        .style("fill", "none")
        .style("stroke-width", "1px")
        .style("opacity", "0");

      mousePerLine.append("text").attr("dx", 10).attr("dy", ".35em");

      mouseG
        .append("svg:rect")
        .attr("width", width)
        .attr("height", singleHeight)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("mouseout", function () {
          d3.selectAll(".mouse-line").style("opacity", "0");
          d3.selectAll(".mouse-per-line circle").style("opacity", "0");
          d3.selectAll(".mouse-per-line text").style("opacity", "0");
        })
        .on("mouseover", function () {
          d3.selectAll(".mouse-line").style("opacity", "1");
          d3.selectAll(".mouse-per-line circle").style("opacity", "1");
          d3.selectAll(".mouse-per-line text").style("opacity", "1");
        })
        .on("mousemove", function (event) {
          // var mouseX = d3.pointer(event, this)[0];
          var mouseX = d3.mouse(this)[0];
          updateTooltips(
            first_chart,
            xScale,
            y1Scale,
            valueField1,
            mouseX,
            color
          );
          updateTooltips(
            second_chart,
            xScale,
            y2Scale,
            valueField2,
            mouseX,
            color
          );
        });
    }

    setupTooltip(first_chart, sumstat, xScale, y1Scale, valueField1);
    setupTooltip(second_chart, sumstat, xScale, y2Scale, valueField2);
  }

  // Виклик функції для ініціалізації тултіпів для обох графіків
  createTooltips(
    first_chart,
    second_chart,
    sumstat,
    x,
    y1,
    y2,
    "budget",
    "contract"
  );

  d3.select("#select-list-1")
    .selectAll("li.auto-added")
    .on("click", function () {
      let clicked_level = d3.select(this).text();
      d3.select("span#selected-region-1").text(clicked_level);
      updateData(clicked_level);
    });

  window.addEventListener("resize", function () {
    updateData(default_level);
  });
});
