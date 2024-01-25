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

  function updateLegend(levels) {
    // Перевірка наявності елементів і їхнє оновлення або видалення
    var p = d3.select("#legend").selectAll("p.auto-added").data(levels);

    p.enter()
      .append("p")
      .attr("class", "auto-added")
      .merge(p)
      .text(function (d) {
        return d;
      })
      .style("color", function (d) {
        return color(d);
      });

    p.exit().remove();
  }

  var margin = { top: 30, right: 30, bottom: 30, left: 70 },
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

    // Знаходження максимальних значень для кожної осі
    let maxBudget = d3.max(init_data, (d) => d.budget);
    let maxContract = d3.max(init_data, (d) => d.contract);

    // Вибір найбільшого з двох максимумів
    let overallMax = d3.max([maxBudget, maxContract]);

    // Встановлення цього максимуму для обох осей
    y1.domain([0, overallMax]);
    y2.domain([0, overallMax]);

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

    first_chart
      .append("g")
      .attr("class", "y axis")
      .call(yAxisLeft)
      .append("text")
      .attr("class", "y-axis-label")
      .attr("text-anchor", "end") // забезпечує правильне вирівнювання тексту
      .attr("transform", "rotate(-90)") // обертає текст для вертикального відображення
      .attr("y", -55) // зміщення від осі Y, залежить від вашої конкретної конфігурації
      .attr("x", -100)
      .attr("dy", ".75em") // зміщення для вирівнювання тексту, може знадобитись налаштування
      .style("font-size", "16px") // розмір шрифту
      .style("fill", "#333") // колір тексту
      .text("Бюджет"); // текст підпис;

    second_chart
      .append("g")
      .attr("class", "y axis")
      .call(yAxisRight)
      .append("text")
      .attr("class", "y-axis-label")
      .attr("text-anchor", "end") // забезпечує правильне вирівнювання тексту
      .attr("transform", "rotate(-90)") // обертає текст для вертикального відображення
      .attr("y", -55) // зміщення від осі Y, залежить від вашої конкретної конфігурації
      .attr("x", -100)
      .attr("dy", ".75em") // зміщення для вирівнювання тексту, може знадобитись налаштування
      .style("font-size", "16px") // розмір шрифту
      .style("fill", "#333") // колір тексту
      .text("Контаркт"); // текст підпис;;

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

  // var linepath1 = d3
  //   .line()
  //   .x(function (d) {
  //     return x(d.date);
  //   })
  //   .y(function (d) {
  //     return y1(d.budget);
  //   });

  // var linepath2 = d3
  //   .line()
  //   .x(function (d) {
  //     return x(d.date);
  //   })
  //   .y(function (d) {
  //     return y2(d.contract);
  //   });

  // CREATE HOVER TOOLTIP WITH VERTICAL LINE //
  tooltip = d3
    .select("#chart-1")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("background-color", "#D3D3D3")
    .style("padding", 6);

  function updateData(level) {
    var filteredData = input[0].filter((d) => d.level === level);

    levels = Array.from(new Set(filteredData.map((d) => d.base))).sort();

    updateLegend(levels);

    console.log(d3.select("#chart-1").node().getBoundingClientRect().width);

    var margin = { top: 30, right: 30, bottom: 30, left: 70 };
    (width =
      d3.select("#chart-1").node().getBoundingClientRect().width -
      margin.left -
      margin.right),
      (height = 700 - 50 - margin.top - margin.bottom),
      (singleHeight = (height - 50) / 2);

    d3.select("#chart-1")
      .select("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    first_chart.attr(
      "transform",
      "translate(" + margin.left + "," + margin.top + ")"
    );

    second_chart.attr(
      "transform",
      "translate(" + margin.left + "," + (margin.top + singleHeight + 50) + ")"
    );

    sumstat = d3
      .nest()
      .key(function (d) {
        return d.base;
      })
      .entries(filteredData);

    var x = d3.scaleTime().range([0, width]),
      y1 = d3.scaleLinear().range([singleHeight, 0]),
      y2 = d3.scaleLinear().range([singleHeight, 0]);

    x.domain(d3.extent(filteredData, (d) => d.date));

    // Знаходження максимальних значень для кожної осі
    let maxBudget = d3.max(filteredData, (d) => d.budget);
    let maxContract = d3.max(filteredData, (d) => d.contract);

    // Вибір найбільшого з двох максимумів
    let overallMax = d3.max([maxBudget, maxContract]);

    // Встановлення цього максимуму для обох осей
    y1.domain([0, overallMax]);
    y2.domain([0, overallMax]);
    // y1.domain([0, d3.max(filteredData, (d) => d.budget)]);
    // y2.domain([0, d3.max(filteredData, (d) => d.contract)]);

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

    first_chart.selectAll(".x.axis").transition().duration(100).call(xAxis);
    first_chart.selectAll(".y.axis").transition().duration(100).call(yAxisLeft);
    second_chart.selectAll(".x.axis").transition().duration(100).call(xAxis);
    second_chart
      .selectAll(".y.axis")
      .transition()
      .duration(750)
      .call(yAxisRight);

    // Стилізація ліній сітки для осі X
    first_chart
      .selectAll(".x.axis .tick line")
      .attr("stroke", "#ccc") // сірий колір
      .attr("stroke-width", 1); // товщина 1px

    // Стилізація ліній сітки для осі Y
    first_chart
      .selectAll(".y.axis .tick line")
      .attr("stroke", "#ccc") // сірий колір
      .attr("stroke-width", 1); // товщина 1px

    // Стилізація ліній сітки для осі X
    second_chart
      .selectAll(".x.axis .tick line")
      .attr("stroke", "#ccc") // сірий колір
      .attr("stroke-width", 1); // товщина 1px

    // Стилізація ліній сітки для осі Y
    second_chart
      .selectAll(".y.axis .tick line")
      .attr("stroke", "#ccc") // сірий колір
      .attr("stroke-width", 1); // товщина 1px

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

    var linepath1 = d3
      .line()
      .x(function (d) {
        return x(d.date);
      })
      .y(function (d) {
        return y1(d.budget);
      })
      .curve(d3.curveNatural); // Це забезпечує заокруглення лінії;;

    var linepath2 = d3
      .line()
      .x(function (d) {
        return x(d.date);
      })
      .y(function (d) {
        return y2(d.contract);
      })
      .curve(d3.curveNatural); // Це забезпечує заокруглення лінії;

    updateChart(first_chart, sumstat, linepath1, y1, "budget");
    updateChart(second_chart, sumstat, linepath2, y2, "contract");
  }

  function updateChart(chart, data, linePath, yScale, valueField) {
    var groups = chart.selectAll(".group").data(data);

    // Remove old elements
    groups.exit().remove();

    // Add new elements
    var newGroups = groups.enter().append("g").attr("class", "group");

    newGroups
      .append("path")
      .attr("class", "line")
      .attr("fill", "none")
      .style("stroke-width", "2px");

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
  }

  updateData(default_level);

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
            yPosition = t.y < yPosition ? yPosition + 20 : yPosition; // Зсув тексту вгору або вниз
            // xPosition = t.x < xPosition ? xPosition + 10 : xPosition - 10; // Зсув тексту вліво або вправо
          }
          yPosition = yPosition - 7;
        });

        tooltips.push({ x: xPosition, y: yPosition });
        if (dataPoint[valueField] !== 0) {
          text
            .text(dataPoint[valueField])
            .style("font-size", "12px") // Зменшений розмір шрифту
            .style("stroke", "white") // Більш темний відтінок сірого
            .style("stroke-width", "5px") // Збільшена товщина обводки
            .style("stroke-opacity", "0.5") // Збільшена прозорість обводки
            .style("paint-order", "stroke") // Визначає порядок рендерингу: спочатку обводка
            .style("stroke-linejoin", "round") // Закруглені кути обводки
            .style("stroke-linecap", "round") // Закруглені кінці обводки
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
          d3.selectAll(".mouse-per-line text")
            .style("opacity", "1")
            .style("stroke", "lightgray") // Колір обводки
            .style("stroke-width", "1px"); // Товщина обводки
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
