// create the svg
var svg = d3.select("svg"),
    margin = { top: 20, right: 20, bottom: 30, left: 40 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
    axisX = g.append("g").attr("class", "axis-x"),
    axisY = g.append("g").attr("class", "axis-y")
legends = g.append("g")
    .attr("class", "legends")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "end"),
    bars = g.append("g").attr("class", "bars");
// set x scale
var x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.05)
    .align(0.1);

// set y scale
var y = d3.scaleLinear()
    .rangeRound([height, 0]);

// set the colors
var z = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);


var labelColumn = 'State';
// load the csv and create the chart
function update(data, keys) {

    console.log("keys ", keys);
    //console.log("data", data);
    data.forEach(d => {
        d.total = 0;
        keys.forEach(col => {
            d.total += d[col];
        })
    })


    //data.sort(function (a, b) { return b.total - a.total; });
    x.domain(data.map(function (d) { return d.State; }));
    y.domain([0, d3.max(data, function (d) { return d.total; })]).nice();
    z.domain(keys);

    var stacks = bars.selectAll("g")
        .data(d3.stack().keys(keys)(data))
        .attr("fill", function (d) { return z(d.key); })
        //.each(d=>{console.log("stackUpdate :", d.key)});
    
    stacks.enter().append("g")
        .attr("fill", function (d) { return z(d.key); })
        //.each(d=>{console.log("stackEnter :", d.key)});
    
    stacks.exit().remove();

    var rect = bars.selectAll("g").selectAll("rect")
        .data(function (d) { return d; })
        .attr("x", function (d) { return x(d.data.State); })
        .attr("y", function (d) { return y(d[1]); })
        .attr("height", function (d) { return y(d[0]) - y(d[1]); })
        .attr("width", x.bandwidth())
        .on("mouseover", function () { tooltip.style("display", null); })
        .on("mouseout", function () { tooltip.style("display", "none"); })
        .on("mousemove", function (d) {
            //console.log(d);
            var xPosition = d3.mouse(this)[0] - 5;
            var yPosition = d3.mouse(this)[1] - 5;
            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select("text").text(d[1] - d[0]);
        })    
        //.each(d=>{console.log("Update :", d.data.State)});

    
    var Enter = rect.enter().append("rect")
        .attr("x", function (d) { return x(d.data.State); })
        .attr("y", function (d) { return y(d[1]); })
        .attr("height", function (d) { return y(d[0]) - y(d[1]); })
        .attr("width", x.bandwidth())
        .on("mouseover", function () { tooltip.style("display", null); })
        .on("mouseout", function () { tooltip.style("display", "none"); })
        .on("mousemove", function (d) {
            //console.log(d);
            var xPosition = d3.mouse(this)[0] - 5;
            var yPosition = d3.mouse(this)[1] - 5;
            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select("text").text(d[1] - d[0]);
        })    
        //.each(d=>{console.log("Enter :", d.data.State)})
    rect.exit().remove();

    axisX.attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x));


    axisY.call(d3.axisLeft(y).ticks(null, "s"))
        .append("text")
        .attr("x", 2)
        .attr("y", y(y.ticks().pop()) + 0.5)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start");

    legends.selectAll("g").remove();
     var legend = legends.selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", z);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function (d) { return d; });

}

// Prep the tooltip bits, initial display is hidden
var tooltip = svg.append("g")
    .attr("class", "tooltip")
    .style("display", "none");

tooltip.append("rect")
    .attr("width", 60)
    .attr("height", 20)
    .attr("fill", "white")
    .style("opacity", 0.5);

tooltip.append("text")
    .attr("x", 30)
    .attr("dy", "1.2em")
    .style("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold");



var Globalkeys = Object.keys(dataState[0]).filter(c => c != labelColumn)
update(dataState.slice(), Globalkeys.slice());


document.getElementById("btn-refresh").addEventListener("click", function () {
    console.log("click")
    let {data, keys} = randomData();
    update(data.slice(0, Math.floor(Math.random()* (data.length-1)+1)), keys);
});

function randomData(){
    let data = [];
    let keyss = Object.assign(Globalkeys);
    keyss = keyss.slice(Math.floor(Math.random() * 1), Math.floor(Math.random() * (keyss.length-2))+2)
    
    dataState.forEach((d, i)=>{
        data.push({
            State : d.State
        });
        keyss.forEach(k => {
            data[i][k] = Math.floor(Math.random() * 796660);
        })
    })
    return {
        data: Object.assign(data),
        keys: Object.assign(keyss)
    }
}
/*
setInterval(function(){
    let {data, keys} = randomData();
    update(data.slice(0, Math.floor(Math.random() * 5)+data.length-5), keys);
},1000)*/