
d3.csv("data/fig_2.csv").then(function(input){

    input.forEach(function(d){
        d.auctions = + d.auctions;
        d.complete = +d.complete;
        d.dif = d.auctions - d.complete;
    });

    var regions =  [...new Set(input.map(function (d) { return d.region; })) ].sort(function(a,b){ return d3.ascending(a,b)});
    var default_region = "Волинська";
    
    d3.select("#select-list-1").select("ul")
        .selectAll("li.auto-added")
        .data(regions)
        .enter()
        .append("li")
        .attr("class", "auto-added")
        .text(function(d){ return d });


    d3.select("#select-list-1").on("click", function () {
        let dropdown = d3.select(this.parentNode).select("ul.dropdown");
        dropdown.classed("hidden", !dropdown.classed("hidden"));
    });


    d3.select("#select-list-1").selectAll('li.auto-added').on("click", function () {
        let clicked_region = d3.select(this).text();
        d3.select("span#selected-region-1").text(clicked_region);
        default_region = clicked_region;
        draw_stacked(clicked_region);
    });


    const margin = {top: 80, right: 10, bottom: 80, left: 150},
        width = d3.select("#chart-2").node().getBoundingClientRect().width - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;


    const svg = d3.select("#chart-2")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + 0 + ")");

    var xScale = d3
        .scaleLinear();


    var yScale = d3
        .scaleBand()
        .paddingInner(0.25);

    svg
        .append("g")
        .attr("class", "x-axis");

    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(" + 0 + "," + 0 + ")");


    svg.append("text")
        .attr('class', "x-axis-label")
        .attr("x", (width - margin.left - margin.right)/2)
        .attr("y", 440)
        .attr("text-anchor", "center")
        .text("кількість аукціонів")
        .style("font-size", "16px");

    var color = d3.scaleOrdinal()
        .domain(["plans", "budget"])
        .range(["#AA2B8E", "#AA2B8E66"]);


    draw_stacked(default_region);

    window.addEventListener("resize", function() {
        draw_stacked(default_region);
    });


    function draw_stacked(region) {

        var df = input.filter(function (d) {
            return d.region === region
        });

        df = df.sort(function(a,b){
           return a.auctions - b.auctions;
        });


        var y_domain = [...new Set(df.map(function (d) { return d.user_company; })) ];


        const real_groups = ["dif", "complete"];
        const desired_groups = ["Всього аукціонів", "Успішних аукціонів"];


        var new_width = d3.select("#chart-2").node().getBoundingClientRect().width - margin.left - margin.right;
        var new_height = df.length * 17 + 50;

        d3.select("#chart-2").select("svg")
            .attr("width", new_width + margin.left + margin.right)
            .attr("height", new_height + margin.top);

        d3.select('.x-axis-label')
            .attr("x", (new_width - margin.left - margin.right) / 2)
            .attr("y", new_height + margin.bottom/2 + 10);


        xScale
            .rangeRound([0, new_width])
            .domain([0, d3.max(df, function (d) {
                return d.auctions
            })]);

        yScale
            .rangeRound([new_height, 0])
            .domain(y_domain);


        svg.select(".y-axis")
            .transition()
            .duration(500)
            .call(d3.axisLeft(yScale)
                .tickFormat(function (d) {
                    return d.substring(0, 15) + "...";
                })
            );

        svg.select(".x-axis")
            .transition()
            .duration(500)
            .attr("transform", "translate(0," + (new_height + 5) + ")")
            .call(d3.axisBottom(xScale)
                    .ticks(4)
                    // .tickFormat(function (d) {
                    //     return nFormatter(d)
                    // })
            );





        var bars_1 = svg.selectAll("rect.auctions")
            .data(df);

        bars_1.exit().remove();

        bars_1.enter()
            .append("rect")
            .attr("class", "auctions tip")
            .attr("width", function (d) {
                return xScale(d.auctions)
            })
            .attr("y", function (d) {
                return xScale(d.user_company)
            })
            .attr("x", function () {
                return xScale(0);
            })
            .attr("height", yScale.bandwidth())
            .attr("rx", yScale.bandwidth() / 2)
            .attr("ry", yScale.bandwidth() / 2)
            .style("stroke", "#529963")
            .style("stroke-width", "2px")
            .style("fill", "transparent")
           // .style("fill", "#529963")
            .merge(bars_1)
            .attr("height", yScale.bandwidth())
            .attr("y", function (d) {
                return yScale(d.user_company);
            })
            .attr("x", function (d) {
                return xScale(0);
            })
            .transition().duration(500)
            .attr("width", function (d) {
                return xScale(d.auctions)
            })

          ;


        var bars_2 = svg.selectAll("rect.complete")
            .data(df);

        bars_2.exit().remove();

        bars_2.enter()
            .append("rect")
            .attr("class", "complete tip")
            .attr("width", function (d) { return xScale(d.complete) })
            .attr("y", function (d) { return xScale(d.user_company) })
            .attr("x", function (d) { return xScale(0); })
            .attr("height", yScale.bandwidth())
            .attr("rx", yScale.bandwidth() / 2)
            .attr("ry", yScale.bandwidth() / 2)
            .style("fill", "#316944" )
            .style("opacity", 0.5)
            .merge(bars_2)
            .attr("height", yScale.bandwidth())
            .attr("y", function (d) { return yScale(d.user_company); })
            .attr("x", function (d) { return xScale(0);   })
            .transition().duration(500)
            .attr("width", function (d) { return xScale(d.complete) });




    }


    
});



// d3.select("#select-list-1").on("click", function () {
//     let dropdown = d3.select(this.parentNode).select("ul.dropdown");
//     dropdown.classed("hidden", !dropdown.classed("hidden"));
// });





//
// function tippyContent(d){
//     let plans = d.data.plans >= 1000 ? moneyFormat(d.data.plans): Math.round(d.data.plans) ;
//     let budget = d.data.budget >= 1000 ? moneyFormat(d.data.budget): Math.round(d.data.budget) ;
//     let money = d.data.money >= 1000 ? moneyFormat(d.data.money): Math.round(d.data.money) ;
//     let products = d.data.products >= 1000 ? moneyFormat(d.data.products): Math.round(d.data.products) ;
//
//     var html = '';
//     html += d.data.wide_cat + ":<br>";
//     html += "Заплановані закупівлі: " + plans + " грн <br>";
//     html += "Бюджетні кошти: " + budget + " грн <br>";
//     html += "Грошові внески: " + money + " грн <br>";
//     html += "Негрошові внески: " + products +" грн";
//
//     return(html);
// }







// tippy('.tip', {
//     allowHTML: true,
//     content: 'Global content',
//     duration: 0,
//     onShow(tip) {
//         tip.setContent(tip.reference.getAttribute('data-tippy-content'))
//     }
//
// });