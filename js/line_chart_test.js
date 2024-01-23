// Завантаження та обробка даних
Promise.all([d3.csv("data/educators_pivoted.csv")]).then(function (input) {
  const parseDate = d3.timeParse("%Y-%m-%d");
  const bisect = d3.bisector((d) => d.date).left;
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  input[0].forEach((d) => {
    d.value = +d.value;
    d.contract = +d.contract;
    d.date = parseDate(d.date);
  });

  // Отримання унікальних значень
  let levels = Array.from(new Set(input[0].map((d) => d.level))).sort();
  let defaultLevel = "Бакалавр";

  // Ініціалізація графіка
  initializeGraph(input[0], defaultLevel, color);

  // Обробники подій
  setupEventHandlers(levels, defaultLevel, input[0]);
});

// Ініціалізація графіка
function initializeGraph(data, defaultLevel, color) {
  // Конфігурація графіка
  const margin = { top: 30, right: 20, bottom: 30, left: 80 };
  const width =
    d3.select("#chart-1").node().getBoundingClientRect().width -
    margin.left -
    margin.right;
  const height = 600 - margin.top - margin.bottom;
  const singleHeight = height / 2;

  // Шкали
  const xScale = d3.scaleTime().range([0, width]);
  const y1Scale = d3.scaleLinear().range([singleHeight, 0]);
  const y2Scale = d3.scaleLinear().range([singleHeight, 0]);

  // Осі
  // TODO: Визначте або імпортуйте multiFormat та nFormatter
  const xAxis = d3
    .axisBottom(xScale)
    .ticks(10)
    .tickFormat(multiFormat)
    .tickSize(-singleHeight);
  const yAxisLeft = d3
    .axisLeft(y1Scale)
    .ticks(5)
    .tickFormat(nFormatter)
    .tickSize(-width);
  const yAxisRight = d3
    .axisLeft(y2Scale)
    .ticks(5)
    .tickFormat(nFormatter)
    .tickSize(-width);

  // Створення SVG
  const svg = d3
    .select("#chart-1")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  // Групи для графіків
  const firstChartGroup = createChartGroup(svg, margin, 0);
  const secondChartGroup = createChartGroup(svg, margin, singleHeight);

  // Ініціалізація даних для графіків
  updateGraph(
    data,
    defaultLevel,
    xScale,
    y1Scale,
    y2Scale,
    firstChartGroup,
    secondChartGroup,
    xAxis,
    yAxisLeft,
    yAxisRight,
    color
  );
}

// Створення групи графіка
function createChartGroup(svg, margin, translateY) {
  return svg
    .append("g")
    .attr("class", "chartGroup")
    .attr("transform", `translate(${margin.left}, ${margin.top + translateY})`);
}

// Оновлення графіка
function updateGraph(
  data,
  level,
  xScale,
  y1Scale,
  y2Scale,
  firstChartGroup,
  secondChartGroup,
  xAxis,
  yAxisLeft,
  yAxisRight,
  color
) {
  // Оновлення даних
  const filteredData = data.filter((d) => d.level === level);
  const sumstat = d3
    .nest() // Тут може знадобитися заміна на d3.group в залежності від версії d3
    .key(function (d) {
      return d.base;
    })
    .entries(filteredData);

  // Масштабування діапазону даних для обох графіків
  xScale.domain(d3.extent(filteredData, (d) => d.date));
  y1Scale.domain([0, d3.max(filteredData, (d) => d.value)]);
  y2Scale.domain([0, d3.max(filteredData, (d) => d.contract)]);

  // Додавання осей
  addAxes(
    firstChartGroup,
    secondChartGroup,
    xScale,
    y1Scale,
    y2Scale,
    xAxis,
    yAxisLeft,
    yAxisRight
  );

  // Додавання ліній до графіків
  addLines(
    firstChartGroup,
    secondChartGroup,
    sumstat,
    xScale,
    y1Scale,
    y2Scale,
    color
  );
}

// Додавання осей
function addAxes(
  firstChartGroup,
  secondChartGroup,
  xScale,
  y1Scale,
  y2Scale,
  xAxis,
  yAxisLeft,
  yAxisRight
) {
  firstChartGroup
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${y1Scale.range()[0]})`)
    .call(xAxis);

  secondChartGroup
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${y2Scale.range()[0]})`)
    .call(xAxis);

  firstChartGroup.append("g").attr("class", "y axis").call(yAxisLeft);

  secondChartGroup.append("g").attr("class", "y axis").call(yAxisRight);
}

// Додавання ліній до графіків
function addLines(
  firstChartGroup,
  secondChartGroup,
  sumstat,
  xScale,
  y1Scale,
  y2Scale,
  color
) {
  const linepath1 = d3
    .line()
    .x((d) => xScale(d.date))
    .y((d) => y1Scale(d.value));

  const linepath2 = d3
    .line()
    .x((d) => xScale(d.date))
    .y((d) => y2Scale(d.contract));

  firstChartGroup
    .selectAll(".line")
    .data(sumstat)
    .enter()
    .append("path")
    .attr("class", "line")
    .attr("d", (d) => linepath1(d.values))
    .attr("fill", "none")
    .style("stroke", (d) => color(d.key))
    .style("stroke-width", "3px");

  secondChartGroup
    .selectAll(".line")
    .data(sumstat)
    .enter()
    .append("path")
    .attr("class", "line")
    .attr("d", (d) => linepath2(d.values))
    .attr("fill", "none")
    .style("stroke", (d) => color(d.key))
    .style("stroke-width", "3px");
}

// Налаштування обробників подій
function setupEventHandlers(levels, defaultLevel, data, xScale, yScale, color) {
  // Обробник події для вибору рівня
  d3.select("#select-list-1")
    .selectAll("li.auto-added")
    .data(levels)
    .enter()
    .append("li")
    .attr("class", "auto-added")
    .text((d) => d)
    .on("click", function () {
      let clickedLevel = d3.select(this).text();
      d3.select("span#selected-region-1").text(clickedLevel);
      updateGraph(
        data,
        clickedLevel,
        xScale,
        y1Scale,
        y2Scale,
        firstChartGroup,
        secondChartGroup,
        xAxis,
        yAxisLeft,
        yAxisRight,
        color
      );
    });

  // Обробник події зміни розміру вікна
  window.addEventListener("resize", function () {
    updateGraph(
      data,
      defaultLevel,
      xScale,
      y1Scale,
      y2Scale,
      firstChartGroup,
      secondChartGroup,
      xAxis,
      yAxisLeft,
      yAxisRight,
      color
    );
  });
}

// Інші необхідні функції
// TODO: Додайте будь-які додаткові функції, необхідні для повної функціональності
