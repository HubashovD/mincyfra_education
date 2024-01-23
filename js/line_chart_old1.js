Promise.all([d3.csv("data/educators_pivoted.csv")]).then(function (input) {
  var parseDate = d3.timeParse("%Y-%m-%d");

  input.forEach(function (d) {
    d.value = +d.value;
    d.contract = +d.contract;
    d.date = parseDate(d.date);
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

  // Налаштування графіку

  var margin = { top: 30, right: 20, bottom: 30, left: 80 },
    width =
      d3.select("#chart-1").node().getBoundingClientRect().width -
      margin.left -
      margin.right,
    height = 400 - margin.top - margin.bottom;

  input[0].forEach(function (d) {
    d.date = parseDate(d.date);
    d.value = +d.value;
  });

  var x = d3.scaleTime().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  var xAxis = d3
    .axisBottom(x)
    .ticks(5)
    .tickFormat(multiFormat)
    .tickSize(-height);

  var yAxis = d3.axisLeft(y).ticks(5).tickFormat(nFormatter).tickSize(-width);

  var valueline = d3
    .line()
    .x(function (d) {
      return x(d.date);
    })
    .y(function (d) {
      return y(d.value);
    });

  var svg = d3
    .select("#chart-1")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  console.log(input[0]);

  var init_data = input[0].filter(function (d) {
    return d.level == "Бакалавр";
  });

  console.log(init_data);

  // Scale the range of the data
  x.domain(
    d3.extent(init_data, function (d) {
      return d.date;
    })
  );
  y.domain([
    0,
    d3.max(init_data, function (d) {
      return d.value;
    }),
  ]);

  // Add the X Axis
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  // Add the Y Axis
  svg.append("g").attr("class", "y axis").call(yAxis);

  var color = d3.scaleOrdinal(d3.schemeCategory10);

  var sumstat = d3
    .nest() // nest function allows to group the calculation per level of a factor
    .key(function (d) {
      return d.base;
    })
    .entries(init_data);

  console.log(sumstat);

  var group = svg
    .selectAll(".group")
    .data(sumstat)
    .enter()
    .append("g")
    .attr("class", "group");

  var linepath = d3
    .line()
    .x(function (d) {
      return x(d.date);
    })
    .y(function (d) {
      return y(d.value);
    });

  group
    .append("path")
    .attr("class", "line")
    .attr("d", function (d) {
      return linepath(d.values);
    })
    .attr("fill", "none")
    .style("stroke", function (d) {
      return color(d.key);
    })
    .style("stroke-width", "3px");

  // Додавання підписів до ліній
  group
    .append("text")
    .attr("transform", function (d) {
      var lastPointIndex = d.values.length - 1; // Остання точка у масиві
      var lastPoint = d.values[lastPointIndex];
      return "translate(" + x(lastPoint.date) + "," + y(lastPoint.value) + ")"; // Позиціонування тексту
    })
    .attr("dy", ".35em") // Вертикальне вирівнювання
    .attr("dx", ".35em") // Горизонтальне вирівнювання (зсув від лінії)
    .style("fill", function (d) {
      return color(d.key);
    }) // Використання кольору лінії для тексту
    .text(function (d) {
      return d.key;
    }); // Використання атрибуту base як тексту підпису

  // CREATE HOVER TOOLTIP WITH VERTICAL LINE //

  var bisect = d3.bisector(function (d) {
    return d.date;
  }).left;

  tooltip = d3
    .select("#chart")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("background-color", "#D3D3D3")
    .style("padding", 6)
    .style("display", "none");

  mouseG = svg.append("g").attr("class", "mouse-over-effects");

  mouseG
    .append("path") // create vertical line to follow mouse
    .attr("class", "mouse-line")
    .style("stroke", "#A9A9A9")
    .style("stroke-width", "1px")
    .style("opacity", "0");

  var mousePerLine = mouseG
    .selectAll(".mouse-per-line")
    .data(sumstat)
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

  mouseG
    .append("svg:rect") // append a rect to catch mouse movements on canvas
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("mouseout", function () {
      // on mouse out hide line, circles and text
      d3.select(".mouse-line").style("opacity", "0");
      d3.selectAll(".mouse-per-line circle").style("opacity", "0");
      d3.selectAll(".mouse-per-line text").style("opacity", "0");
      d3.selectAll("#tooltip").style("display", "none");
    })
    .on("mouseover", function () {
      // on mouse in show line, circles and text
      d3.select(".mouse-line").style("opacity", "1");
      d3.selectAll(".mouse-per-line circle").style("opacity", "1");
      d3.selectAll("#tooltip").style("display", "block");
    })
    .on("mousemove", function (event) {
      var mouse = d3.mouse(this);
      var mouseX = mouse[0];
      var mouseY = mouse[1];

      var currentData; // Змінна для зберігання поточних даних

      d3.selectAll(".mouse-per-line").attr("transform", function (d, i) {
        var xDate = x.invert(mouse[0]);
        var idx = bisect(d.values, xDate);
        if (idx >= d.values.length || idx < 0) return;

        currentData = d; // Зберігаємо поточні дані

        return (
          "translate(" +
          x(d.values[idx].date) +
          "," +
          y(d.values[idx].value) +
          ")"
        );
      });
      d3.selectAll(".mouse-per-line").each(function (d, i) {
        var xDate = x.invert(mouseX);
        var idx = bisect(d.values, xDate);
        if (idx >= d.values.length || idx < 0) return;

        // Оновлення позиції лінії
        d3.select(this).attr(
          "transform",
          "translate(" +
            x(d.values[idx].date) +
            "," +
            y(d.values[idx].value) +
            ")"
        );

        // Додавання або оновлення тексту
        var group = d3.select(this); // Вибір поточної групи
        var text = group.select("text"); // Вибір тексту в групі
        if (text.empty()) {
          group
            .append("text")
            .attr("x", 10) // Зсув відносно кола
            .attr("y", 0)
            .text(d.values[idx].value);
        } else {
          text.attr("x", 10).attr("y", 0).text(d.values[idx].value);
        }
      });
    });

  function updateData(level) {
    var filteredData = input[0].filter((d) => d.level === level);

    sumstat = d3
      .nest() // nest function allows to group the calculation per level of a factor
      .key(function (d) {
        return d.base;
      })
      .entries(filteredData);

    // Оновлення даних для mouse-per-line
    var mousePerLine = mouseG
      .selectAll(".mouse-per-line")
      .data(sumstat, function (d) {
        return d.key;
      }); // Використання унікального ключа

    // Видалення старих елементів
    mousePerLine.exit().selectAll("text").remove(); // Видалення тексту
    mousePerLine.exit().remove();

    // Додавання нових груп, якщо потрібно
    var newMousePerLine = mousePerLine
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");

    newMousePerLine
      .append("circle")
      .attr("r", 4)
      .style("stroke", function (d) {
        return color(d.key);
      })
      .style("fill", "none")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    // Оновлення існуючих елементів з новими даними
    mousePerLine = newMousePerLine.merge(mousePerLine);

    mousePerLine.select("circle").style("stroke", function (d) {
      return color(d.key);
    });

    // Оновлення або додавання тексту
    mousePerLine.each(function (d) {
      var group = d3.select(this);
      var text = group.select("text");

      if (text.empty()) {
        group
          .append("text")
          .attr("x", 10)
          .attr("y", 0)
          .text(function (d) {
            return d.values[0].value;
          }); // Оновлення тексту
      } else {
        text
          .attr("x", 10)
          .attr("y", 0)
          .text(function (d) {
            return d.values[0].value;
          }); // Оновлення тексту
      }
    });

    var new_width =
      d3.select("#chart-1").node().getBoundingClientRect().width -
      margin.left -
      margin.right;

    d3.select("#chart-1")
      .select("svg")
      .attr("width", new_width + margin.left + margin.right);

    // Scale the range of the data again
    x.domain(d3.extent(filteredData, (d) => d.date));

    y.domain([0, d3.max(filteredData, (d) => d.value)]);

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
        return color(d.key);
      })
      .transition()
      .duration(750);

    svg.selectAll(".x.axis").transition().duration(750).call(xAxis);
    svg.selectAll(".y.axis").transition().duration(750).call(yAxis);

    // Додавання підписів до ліній
    group
      .append("text")
      .attr("transform", function (d) {
        var lastPointIndex = d.values.length - 1; // Остання точка у масиві
        var lastPoint = d.values[lastPointIndex];
        return (
          "translate(" + x(lastPoint.date) + "," + y(lastPoint.value) + ")"
        ); // Позиціонування тексту
      })
      .attr("dy", ".35em") // Вертикальне вирівнювання
      .attr("dx", ".35em") // Горизонтальне вирівнювання (зсув від лінії)
      .style("fill", function (d) {
        return color(d.key);
      }) // Використання кольору лінії для тексту
      .text(function (d) {
        return d.key;
      }); // Використання атрибуту base як тексту підпису
  }
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
