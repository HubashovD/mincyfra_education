// switch on hide section

d3.select(".how-to-section").on("click", function () {
  this.classList.toggle("is-closed");
  this.classList.toggle("is-open");
});

const rowConverterData = function (d) {
  keys = Object.keys(d);

  keys.forEach(function (key) {
    if (key === "month") {
      // d[key] = parseTime(d[key])
    } else if (isNaN(parseFloat(d[key])) == false) {
      d[key] = +d[key];
    } else if (d[key] === "") {
      d[key] = NaN;
    }
  });

  return d;
};

optFigures = {
  fig_2: {
    label: "region",
    columns: ["tot_records", "tot_tickets", "tot_usable_volume", "region"],
  },
  fig_3: {
    label: "logging_categories",
    columns: [
      "tot_records",
      "perc_usbl_vol",
      "tot_usable_volume",
      "logging_categories",
    ],
  },
};

const createLollipopChart = function (
  dataset,
  box,
  label,
  c1,
  c2,
  reset,
  textAnchor = "start",
  drawLabels = true,
  smooth = true,
  yPadding
) {
  w = box.node().getBoundingClientRect().width;
  // h = box.node().getBoundingClientRect().height

  h = (20 + 20 * 0.3) * dataset.length + 32;

  padding =
    box.node().parentNode.getBoundingClientRect().width >= 768 && c2
      ? { left: 48, right: 48, top: 16, bottom: yPadding }
      : { left: 8, right: 48, top: 16, bottom: yPadding };

  if (c2) {
    xVals = dataset.map((d) => d[c1]).concat(dataset.map((d) => d[c2]));
  } else {
    xVals = dataset.map((d) => d[c1]);
  }

  let xScale = d3
    .scaleLinear()
    .domain([0, d3.max(xVals)])
    .range([padding.left, w - padding.right]);
  // .range([0, w])

  let xAxis = d3
    .axisBottom()
    .scale(xScale)
    .ticks(c1 === "tot_usbl_vol" ? 3 : 5)
    .tickSize(0);

  let yScale = d3
    .scaleBand()
    .domain(dataset.map((d) => d[label]))
    .range([padding.top, h - padding.bottom])
    .paddingOuter(0.1);

  if (!reset) {
    svg = box.append("svg").attr("width", w).attr("height", h);

    if (drawLabels) {
      svgLabels = d3
        .select(box.node().parentNode)
        .select(".labels-region")
        .append("svg")
        .attr("width", "100%")
        .attr("height", h);

      svgLabels
        .selectAll("text")
        .data(dataset)
        .enter()
        .append("text")
        .text((d) => d[label])
        .attr("y", (d) => yScale(d[label]))
        .attr("dy", 3)
        .attr("x", 0)
        .attr("dx", textAnchor == "middle" ? "50%" : 0)
        .attr("text-anchor", textAnchor);
    }

    if (c2) {
      svg
        .selectAll("g")
        .data(dataset)
        .enter()
        .append("g")
        .attr("class", "vals")
        .call(function (g) {
          g.append("line")
            .attr("x1", (d) => xScale(d[c1]))
            .attr("x2", (d) => xScale(d[c2]))
            .attr("y1", (d) => yScale(d[label]))
            .attr("y2", (d) => yScale(d[label]))
            .attr("stroke", "#80CCB3")
            .attr("stroke-width", "1px");
        })
        .call(function (g) {
          g.append("circle")
            .attr("r", 6)
            .attr("cy", (d) => yScale(d[label]))
            .attr("cx", (d) => xScale(d[c1]))
            .attr("class", "c1")
            .attr("fill", "#73EB68")
            .append("title")
            .text(function (d) {
              return d[label] + ": " + d[c1].toFixed(1);
            });
        })
        .call(function (g) {
          g.append("circle")
            .attr("r", 6)
            .attr("cy", (d) => yScale(d[label]))
            .attr("cx", (d) => xScale(d[c2]))
            .attr("class", "c2")
            .attr("fill", "#275930")
            .append("title")
            .text(function (d) {
              return d[label] + ": " + d[c2].toFixed(1);
            });
        });

      let circles = [c1, c2];

      circles.forEach(function (c, i) {
        circleClass = i === 0 ? "c1" : "c2";
        svg
          .selectAll("g.vals")
          .data(dataset)
          .append("text")
          .attr("class", circleClass)
          // .text(d => Math.round(d[c]))
          // .text(d => Math.round10(d[c]))
          // .text(d => (c1 == "tot_usbl_vol.san") ? d[c].toFixed(1) : Math.round(d[c]))
          .text((d) => d[c].toFixed(1))
          .style("font-size", "10")
          .attr("x", (d) => xScale(d[c]))
          .attr("y", (d) => yScale(d[label]));
      });

      texts = svg.selectAll("g.vals").selectAll("text");
      texts._groups.forEach(function (pair) {
        (p1 = pair[0]), (p2 = pair[1]);
        (x1 = p1.getBoundingClientRect().x),
          (x2 = p2.getBoundingClientRect().x);

        if (x1 > x2) {
          d3.select(p1).attr("text-anchor", "start").attr("dx", 10);
          d3.select(p2).attr("text-anchor", "end").attr("dx", -10);
        } else {
          d3.select(p1).attr("text-anchor", "end").attr("dx", -10);
          d3.select(p2).attr("text-anchor", "start").attr("dx", 10);
        }
      });
    } else {
      svg
        .selectAll("g")
        .data(dataset)
        .enter()
        .append("g")
        .attr("class", "vals")
        .call(function (g) {
          g.append("line")
            .attr("x1", (d) => xScale(d[c1]))
            .attr("x2", padding.left)
            // .attr("x2", 0)
            .attr("y1", (d) => yScale(d[label]))
            .attr("y2", (d) => yScale(d[label]))
            .attr("stroke", "#469A66")
            .attr("stroke-width", "1px");
        })
        .call(function (g) {
          g.append("circle")
            .attr("r", 6)
            .attr("cy", (d) => yScale(d[label]))
            .attr("cx", (d) => xScale(d[c1]))
            .attr("class", "c1")
            .attr("fill", "#469A66")
            .append("title")
            .text(function (d) {
              return d[label] + ": " + d[c1];
            });
        })
        .call(function (g) {
          g.append("text")
            .attr("class", "c1")
            .text((d) => Math.round(d[c1]))
            .style("font-size", "10")
            .attr("x", (d) => xScale(d[c1]))
            .attr("dx", 10)
            .attr("y", (d) => yScale(d[label]));
        });
    }

    // d3.select(box.node().parentNode).select(".axis-box").append("svg")
    //     .attr("width", w)
    //     .attr("height", 48)
    //     .append("g")
    //     .attr("class", "axis x")
    //     .transition().duration(800)
    //     .call(xAxis)

    svg
      .append("g")
      .attr("class", "axis x")
      .transition()
      .duration(800)
      .attr("transform", "translate(0," + (h - padding.bottom + 5) + ")")
      .call(xAxis);

    if (c1 == "tot_usbl_vol.san") {
      svg
        .append("g")
        .attr("class", "label x")
        .attr(
          "transform",
          "translate(" +
            (padding.left - 5) +
            "," +
            (h - padding.bottom + 55) +
            ")"
        )
        .append("text")
        .transition()
        .duration(800)
        .text("Тис. куб. м. деревини");
    }
  } else {
    svgBeforeHeight = box.select("svg").node().getBBox().height;
    svg = box.select("svg").attr("height", h);

    svg.transition().duration(800).attr("height", h);

    svg
      .select(".axis.x")
      .attr("transform", "translate(0," + (h - padding.bottom + 4) + ")")
      .call(xAxis);

    if (c1 == "tot_usbl_vol.san") {
      svg
        .select(".label.x")
        .attr(
          "transform",
          "translate(" +
            (padding.left - 5) +
            "," +
            (h - padding.bottom + 55) +
            ")"
        );
    }

    if (smooth) {
      grid = box.node().parentNode;
      boxNewHeight =
        grid.getBoundingClientRect().height - svgBeforeHeight + h - 32;
      // d3.select(grid).transition().duration(800).style("height", boxNewHeight + "px")
    }

    if (drawLabels) {
      svgLabels = d3
        .select(box.node().parentNode)
        .select(".labels-region")
        .select("svg");
      svgLabels.attr("height", h);

      labels = svgLabels
        .selectAll("text")
        .data(dataset)
        .attr("y", (d) => yScale(d[label]));
      labels.text((d) => d[label]);
      labels.exit().remove();

      labelsNew = labels
        .enter()
        .append("text")
        .text((d) => d[label])
        .attr("y", (d) => yScale(d[label]))
        .attr("dy", 3)
        .attr("x", 0)
        .attr("dx", textAnchor == "middle" ? "50%" : 0)
        .attr("text-anchor", textAnchor);
    }

    if (c2) {
      g = svg.selectAll("g.vals").data(dataset);
      g.call(function (g) {
        g.select("line")
          // .attr("x1", d => xScale(d[c1]))
          // .attr("x2", d => xScale(d[c2]))
          .attr("y1", (d) => yScale(d[label]))
          .attr("y2", (d) => yScale(d[label]));
      })
        .call(function (g) {
          g.select("circle.c1")
            .attr("cy", (d) => yScale(d[label]))
            // .attr("cx", d => xScale(d[c1]))
            .select("title")
            .text(function (d) {
              return d[label] + ": " + d[c1];
            });
        })
        .call(function (g) {
          g.select("circle.c2")
            .attr("cy", (d) => yScale(d[label]))
            // .attr("cx", d => xScale(d[c2]))
            .select("title")
            .text(function (d) {
              return d[label] + ": " + d[c2];
            });
        })
        .call(function (g) {
          g.select("text.c1")
            // .text(d => Math.round(d[c1]))
            .text((d) => d[c1].toFixed(1))
            // .text(d => (c1 == "tot_usbl_vol.san") ? d[c1].toFixed(1) : Math.round(d[c1]))
            .attr("x", (d) => xScale(d[c1]))
            .attr("y", (d) => yScale(d[label]));
        })
        .call(function (g) {
          g.select("text.c2")
            // .text(d => Math.round(d[c2]))
            .text((d) => d[c2].toFixed(1))
            // .text(d => (c1 == "tot_usbl_vol.san") ? d[c2].toFixed(1) : Math.round(d[c2]))
            .attr("x", (d) => xScale(d[c2]))
            .attr("y", (d) => yScale(d[label]));
        });

      g.exit().remove();

      gNew = g
        .enter()
        .append("g")
        .attr("class", "vals")
        .call(function (g) {
          g.append("line")
            .attr("stroke", "#80CCB3")
            // .attr("x1", d => xScale(d[c1]))
            // .attr("x2", d => xScale(d[c2]))
            .attr("y1", (d) => yScale(d[label]))
            .attr("y2", (d) => yScale(d[label]));
        })
        .call(function (g) {
          g.append("circle")
            .attr("r", 6)
            .attr("cy", (d) => yScale(d[label]))
            // .attr("cx", d => xScale(d[c1]))
            .attr("class", "c1")
            .attr("fill", "#73EB68")
            .append("title")
            .text(function (d) {
              return d[label] + ": " + d[c1];
            });
        })
        .call(function (g) {
          g.append("circle")
            .attr("r", 6)
            .attr("cy", (d) => yScale(d[label]))
            // .attr("cx", d => xScale(d[c2]))
            .attr("class", "c2")
            .attr("fill", "#275930")
            .append("title")
            .text(function (d) {
              return d[label] + ": " + d[c2];
            });
        })
        .call(function (g) {
          g.append("text")
            .attr("class", "c1")
            .text((d) => Math.round(d[c1]))
            .style("font-size", "10")
            .attr("x", (d) => xScale(d[c1]))
            .attr("y", (d) => yScale(d[label]));
        })
        .call(function (g) {
          g.append("text")
            .attr("class", "c2")
            .text((d) => Math.round(d[c2]))
            .style("font-size", "10")
            .attr("x", (d) => xScale(d[c2]))
            .attr("y", (d) => yScale(d[label]));
        });

      svg
        .selectAll("g.vals")
        .call((g) =>
          g
            .selectAll("line")
            .transition()
            .duration(800)
            .attr("x1", (d) => xScale(d[c1]))
            .attr("x2", (d) => xScale(d[c2]))
        )
        .call((g) =>
          g
            .selectAll("circle.c1")
            .transition()
            .duration(800)
            .attr("cx", (d) => xScale(d[c1]))
        )
        .call((g) =>
          g
            .selectAll("circle.c2")
            .transition()
            .duration(800)
            .attr("cx", (d) => xScale(d[c2]))
        );

      texts = svg.selectAll("g.vals").selectAll("text");
      texts._groups.forEach(function (pair) {
        (p1 = pair[0]), (p2 = pair[1]);
        (x1 = xScale(p1.textContent)), (x2 = xScale(p2.textContent));

        if (x1 > x2) {
          d3.select(p1).attr("text-anchor", "start").attr("dx", 10);
          d3.select(p2).attr("text-anchor", "end").attr("dx", -10);
        } else {
          d3.select(p1).attr("text-anchor", "end").attr("dx", -10);
          d3.select(p2).attr("text-anchor", "start").attr("dx", 10);
        }
      });
    } else {
      g = svg.selectAll("g.vals").data(dataset);
      g.call(function (g) {
        g.select("line")
          // .attr("x1", d => xScale(d[c1]))
          // .attr("x2", padding)
          .attr("y1", (d) => yScale(d[label]))
          .attr("y2", (d) => yScale(d[label]));
      })
        .call(function (g) {
          g.select("circle.c1")
            .attr("cy", (d) => yScale(d[label]))
            // .attr("cx", d => xScale(d[c1]))
            .select("title")
            .text(function (d) {
              return d[label] + ": " + d[c1];
            });
        })
        .call(function (g) {
          g.select("text")
            .text((d) => Math.round(d[c1]))
            .attr("x", (d) => xScale(d[c1]))
            .attr("y", (d) => yScale(d[label]));
        });

      g.exit().remove();

      gNew = g
        .enter()
        .append("g")
        .attr("class", "vals")
        .call(function (g) {
          g.append("line")
            // .attr("x1", d => xScale(d[c1]))
            // .attr("x2", padding)
            .attr("y1", (d) => yScale(d[label]))
            .attr("y2", (d) => yScale(d[label]))
            .attr("stroke", "#469A66")
            .attr("stroke-width", "1px");
        })
        .call(function (g) {
          g.append("circle")
            .attr("r", 6)
            .attr("cy", (d) => yScale(d[label]))
            // .attr("cx", d => xScale(d[c1]))
            .attr("class", "c1")
            .attr("fill", "#469A66")
            .append("title")
            .text(function (d) {
              return d[label] + ": " + d[c1];
            });
        })
        .call(function (g) {
          g.append("text")
            .attr("class", "c1")
            .text((d) => Math.round(d[c1]))
            .style("font-size", "10")
            .attr("x", (d) => xScale(d[c1]))
            .attr("dx", 10)
            .attr("y", (d) => yScale(d[label]));
        });

      svg
        .selectAll("g.vals")
        .call((g) =>
          g
            .selectAll("line")
            .transition()
            .duration(800)
            .attr("x1", (d) => xScale(d[c1]))
            .attr("x2", (d) => padding.left)
        )
        .call((g) =>
          g
            .selectAll("circle.c1")
            .transition()
            .duration(800)
            .attr("cx", (d) => xScale(d[c1]))
        );
    }
  }

  return yScale;
};

const sanCompareChart2 = function () {
  d3.csv("data/fig_6_san_v3.csv", rowConverterData).then(function (data) {
    let defaultRegion = "Державна";
    defaultRegionData = data.filter((d) => d["region"] === defaultRegion);
    defaultRegionData.sort(function (a, b) {
      return b["tot_records"] - a["tot_records"];
    });

    console.log(data);

    regions = Array.from(new Set(data.map((d) => d.region)));

    d3.select("#select-list-2")
      .select("ul")
      .selectAll("li.auto-added")
      .data(regions)
      .enter()
      .append("li")
      .attr("class", "auto-added")
      .text(function (d) {
        return d;
      });

    d3.select("#select-list-2").on("click", function () {
      let dropdown = d3.select(this.parentNode).select("ul.dropdown");
      dropdown.classed("hidden", !dropdown.classed("hidden"));
    });

    // optionsBlock = d3
    //   .select(".region-choice-container#s2")
    //   .select(".region-options");
    // optionsBlock
    //   .selectAll("div")
    //   .data(regions)
    //   .enter()
    //   .append("div")
    //   .attr("class", "r-val")
    //   .text((d) => d);

    // d3.select(".region-choice-container#s2")
    //   .select(".region-choice")
    //   .on("click", function () {
    //     optionsBlock = d3
    //       .select(".region-choice-container#s2")
    //       .select(".region-options");
    //     optionsBlock.node().classList.toggle("active");
    //   });

    boxLeft = d3.select(".solid-san-grid#ssg2 .tot_records");
    createLollipopChart(
      defaultRegionData,
      boxLeft,
      "user_company",
      "tot_records",
      undefined,
      false,
      (textAnchor = "start"),
      (drawLabels = true),
      (smooth = true),
      (yPadding = 32)
    );

    boxRight = d3.select(".solid-san-grid#ssg2 .tot_usbl_vol");
    createLollipopChart(
      defaultRegionData,
      boxRight,
      "user_company",
      "tot_usbl_vol",
      undefined,
      false,
      (textAnchor = "start"),
      (drawLabels = false),
      (smooth = true),
      (yPadding = 32)
    );

    d3.select("#select-list-2")
      .selectAll("li.auto-added")
      .on("click", function () {
        let regionSelected = d3.select(this).text();
        d3.select("span#selected-region-2").text(regionSelected);
        // updateData(clicked_level);
        // });

        // d3.select(".region-choice-container#s2")
        //   .select(".region-options")
        //   .selectAll(".r-val")
        //   .on("click", function () {
        //     this.parentNode.classList.toggle("active");

        //     regionSelected = this.textContent;
        //     d3.select(".region-choice-container#s2")
        //       .select(".region-filter text")
        //       .text(regionSelected);

        boxLeft = d3.select(".solid-san-grid#ssg2 .tot_records");
        boxRight = d3.select(".solid-san-grid#ssg2 .tot_usbl_vol");

        regionData = data.filter((d) => d["region"] === regionSelected);
        regionData.sort(function (a, b) {
          return b["tot_records"] - a["tot_records"];
        });

        createLollipopChart(
          regionData,
          boxLeft,
          "user_company",
          "tot_records",
          undefined,
          true,
          (textAnchor = "start"),
          (drawLabels = true),
          (smooth = true),
          (yPadding = 32)
        );
        createLollipopChart(
          regionData,
          boxRight,
          "user_company",
          "tot_usbl_vol",
          undefined,
          true,
          (textAnchor = "start"),
          (drawLabels = false),
          (smooth = false),
          (yPadding = 32)
        );
      });
  });
};

sanCompareChart2();
