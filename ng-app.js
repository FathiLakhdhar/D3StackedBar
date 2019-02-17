angular.module("myapp", [])
    .controller("myCtrl", function ($scope) {
        $scope.data = dataState;
        $scope.colors = ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"];
        $scope.ngrefresh = function () {
            let data = [];
            let keyss = Object.keys(dataState[0]).filter(c => c != 'State');
            dataState.forEach((d, i) => {
                data.push({
                    State: d.State
                });
                keyss.forEach(k => {
                    data[i][k] = Math.floor(Math.random() * 796660);
                })
            });
            $scope.data = data.slice(0, Math.floor(Math.random() * 5) + data.length - 5);
        }
    })
    .component('d3StackedBar', {
        template: '<svg id="ng"></svg>',
        bindings: {
            data: '<',
            itemLabel: '@',
            colors: '<'
        },
        controller: function d3StackedBarController($scope, $element) {
            var self = this;

            console.log($element[0].parentElement.clientWidth)
            console.log($element[0].parentElement.clientHeight)


            // create the svg
            var parent_w = $element[0].parentElement.clientWidth,
                parent_h = $element[0].parentElement.clientHeight,
                svg = d3.select("svg#ng").attr("width", parent_w).attr("height", parent_h),
                margin = { top: 20, right: 20, bottom: 30, left: 40 },
                padding = { top: 20, right: 20, bottom: 30, left: 40 },
                width = parent_w - margin.left - margin.right - padding.left,
                height = parent_h - margin.top - margin.bottom,
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
            var defaultColors = ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"];
                

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


            self.$onInit = function () {
                console.log("--- Init ---");
                self.itemLabel = self.itemLabel || 'label';
                self.colors = self.colors || defaultColors;
                console.log(self.data);
                console.log(self.itemLabel);
            }

            self.$onChanges = function (changes) {
                console.log(changes.data.currentValue);
                self.update(changes.data.currentValue)
            };



            self.update = function (data) {

                var keys = Object.keys(data[0]).filter(c => c != self.itemLabel && c != 'total');

                console.log("keys ", keys);
                //console.log("data", data);
                data.forEach(d => {
                    d.total = 0;
                    keys.forEach(col => {
                        d.total += d[col];
                    })
                })


                //data.sort(function (a, b) { return b.total - a.total; });
                x.domain(data.map(function (d) { return d[self.itemLabel]; }));
                y.domain([0, d3.max(data, function (d) { return d.total; })]).nice();
                var color = d3.scaleOrdinal().range(self.colors).domain(keys);

                var stacks = bars.selectAll("g")
                    .data(d3.stack().keys(keys)(data))
                    .attr("fill", function (d) { return color(d.key); })
                //.each(d=>{console.log("stackUpdate :", d.key)});

                stacks.enter().append("g")
                    .attr("fill", function (d) { return color(d.key); })
                //.each(d=>{console.log("stackEnter :", d.key)});

                stacks.exit().remove();

                var rect = bars.selectAll("g").selectAll("rect")
                    .data(function (d) { return d; })
                    .attr("x", function (d) { return x(d.data[self.itemLabel]); })
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
                //.each(d=>{console.log("Update :", d.data[self.itemLabel])});


                var Enter = rect.enter().append("rect")
                    .attr("x", function (d) { return x(d.data[self.itemLabel]); })
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
                //.each(d=>{console.log("Enter :", d.data[self.itemLabel])})
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
                    .attr("x", width - 5 + padding.left)
                    .attr("width", 19)
                    .attr("height", 19)
                    .attr("fill", color);

                legend.append("text")
                    .attr("x", width - 10 + padding.left)
                    .attr("y", 9.5)
                    .attr("dy", "0.32em")
                    .text(function (d) { return d; });

            }
        }
    });