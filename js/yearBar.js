//Sources: Elan Miller's Assignment 2

class YearBar {
    constructor(stlMap) {
        this.stlMap = stlMap
        //use same year as what is associated with the map
        this.year = this.stlMap.year
        this.years = [{year:1970}, {year:1980}, {year:1990}, {year:2000}, {year:2010}]
        this.w = 1200
        this.h = 500
        this.padding = 25
        this.lineStartBuffer = 20
        this.x_1 = 0
        this.x_2 = this.w
        this.y_1 = this.padding
        this.y_2 = this.padding
        this.defaultYear = 2010
        this.isFirst = true
        this.minYear = 1970
        this.maxYear = 2010
    }

    update() {
        //to access constructor variables
        var self = this;
        //create line as width of canvas with circles distributed along
        //to scale the year on the line
        var yearRange = d3.scaleLinear().domain([self.minYear, self.maxYear]).range([0 + this.lineStartBuffer, this.w - this.lineStartBuffer]);
        var svg = d3.select("#year-area")
            .append("svg")
            .attr("width", this.w)
            .attr("height", this.h * 0.1);
        var line_g = svg.append("g");
        var circles_on_lines = line_g.append("line")
            .attr("x1", this.x_1)
            .attr("y1", this.y_1)
            .attr("x2", this.x_2)
            .attr("y2", this.y_2)
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", ("3, 3"))
            .attr("stroke", "black");


            var yearText = line_g.selectAll("text")
            .data(self.years)
            .enter()
            .append("text");
        var yearTextLabels = yearText
            .attr("x", function (d) {
                return yearRange(parseInt(d.year));
            })
            .attr("y", this.padding * 2)
            .text(function (d) {
                return d.year;
            })
            .attr("class", "number")
            .attr("text-anchor", "middle");

        //put dots on line
        var circles = line_g.selectAll("circle")
            .data(self.years)
            .enter()
            .append("circle")
            .attr("id", function(d) {
                if (d.year == self.year) {
                    return "chosenCircle"
                }
                return "notChosen"
            })
            .attr("class", function (d, i) {
                    return "year_" + (1970 + 10 * i).toString()
            })
            .attr("cx", function (d) {
                return yearRange(parseInt(d.year));
            })
            .attr("cy", this.padding)
            .attr("r", function (d) {
                //increase radius for selected year
                if (d.year == self.year) {
                    return 12
                }
                return 8
            })
            .attr("fill", function (d) {
                //highlight circle of current year
                if (d.year == self.year) {
                    return "#116466";
                }
                return "#FFCB94";
            })
            .attr("stroke", "black")
            .attr("stroke-width", 1.0)


            .on("click", function (d, i) {
                //reset the chosen circle
                line_g.selectAll("#chosenCircle")
                .attr("id", "notChosen")
                .attr("fill", "#FFCB94")
                .attr("r", 8)

                
                var chosenClass = ".year_" + (1970 + 10 * i).toString()


                line_g.selectAll(chosenClass)
                .attr("id", "chosenCircle")
                .attr("cx", yearRange(parseInt(d.year)))
                .attr("cy", 25)
                .attr("r", function () {
                    return 12
                })
                .attr("fill", function () {
                    return "#116466";
                })
                .attr("stroke", "black")
                .attr("stroke-width", 1.0)
                

                // line_g.selectAll("circle")



                self.year = parseInt(d.year)
                //update stl map year
                self.stlMap.year = self.year
                self.stlMap.update()
            })

        //update stl map based on year
        self.stlMap.update()

    }

}