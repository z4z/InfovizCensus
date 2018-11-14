class Map {

    constructor(year) {
        this.year = year
        this.width = 650
        this.height = 650
    }

    update() {

        var self = this

        //remove and update div
        d3.select("#chart-area").remove()
        d3.select("#year-col").append("div")
        .attr("id", "chart-area")

        var svg = d3.select("#chart-area").append("svg")
            .attr("width", this.width)
            .attr("height", this.height)

        var canvas = d3.select("#chart-area").append("canvas")
            .attr("width", this.width)
            .attr("height", this.height)
            .style("display", "none");

        var context = canvas.node().getContext("2d")

        Promise.all([
            d3.json('map/stl.json'),
            d3.csv('data/' + self.year.toString() + '.csv'),
            this
        ]).then(function(data) {
            var self = data[2]
            var stl = data[0]
            var d2010 = data[1]
    
            var projection = d3.geoTransverseMercator()
                .rotate([90 + 30 / 60, -35 - 50 / 60])
                .fitSize([self.width, self.height], stl)
    
            var path = d3.geoPath()
                .projection(projection);

    
            var tracts = stl.features
    
            svg.append("g")
                .selectAll("path")
                .data(tracts)
                .enter().append("path")
                .attr("class", "tract")
                .attr("d", path)
    
            var num_tracts = tracts.length
    
            var stl_tract_ids = []
            for (var i = 0; i < num_tracts; i++) {
                var tract_id = tracts[i].properties.TRACTCE10
                stl_tract_ids.push(tract_id)
            }
    
            // This will work if stl_tract_ids is sorted (close, but it's not)
            // function binarySearch(target, low, high) {
            //     var mid = low + Math.floor((high - low) / 2)
            //     var result = stl_tract_ids[mid]
            //     if (target == result) {
            //         return index
            //     }
            //     if (target > result) {
            //         return binarySearch(target, mid+1, high)
            //     }
            //     else {
            //         return binarySearch(target, low, mid-1)
            //     }
            // }
    
            var white_col = 'SE_T054_002',
            black_col = 'SE_T054_003',
            tract_id_col = 'Geo_TRACT'
    
            var white_by_tract = new Array(num_tracts)
            var black_by_tract = new Array(num_tracts)
    
            for (var i = 0; i < num_tracts; i++) {
                var tract_data = d2010[i]
                var tract_id = parseInt(tract_data[tract_id_col])
    
                var num_white = parseInt(tract_data[white_col])
                var num_black = parseInt(tract_data[black_col])
    
                var tract_index = 0
                for (var j = 0; j < num_tracts; j++) {
                    if (tract_id == stl_tract_ids[j]) {
                        tract_index = j
                        break
                    }
                }
                white_by_tract[tract_index] = num_white
                black_by_tract[tract_index] = num_black
            }
    
            for (var i = 0; i < num_tracts; i++) {
                var r = Math.floor(i / 256),
                    g = i % 256
    
                var coordinates = tracts[i].geometry.coordinates,
                    fill = "rgb(" + r + "," + g + ",0)"
    
                self.drawPolygon(coordinates, fill, context, projection)
            }
    
            var pixels = context.getImageData(0, 0, self.width, self.height).data;
    
            for (var i = 0; i < num_tracts; i++) {
                var tract = tracts[i]
                var white_pop = Math.round(white_by_tract[i] / 50)
                var black_pop = Math.round(black_by_tract[i] / 50)
    
                var bounds = path.bounds(tract),
                    x0 = bounds[0][0],
                    y0 = bounds[0][1],
                    w = bounds[1][0] - x0,
                    h = bounds[1][1] - y0
    
                for (var j = 0; j < white_pop; j++) {
                    var tries = 1
    
                    while (true) {
                        var x = Math.round(x0 + Math.random() * w),
                            y = Math.round(y0 + Math.random() * h)
    
                        var r = Math.floor(i / 256),
                            g = i % 256
    
                        var index = (x + y * self.width) * 4
    
                        var actual_r = pixels[index],
                            actual_g = pixels[index + 1]
    
                        var contains = actual_r == r && actual_g == g
                        if (contains) {
                            svg.append("circle")
                                .attr("cx", x)
                                .attr("cy", y)
                                .attr("r", 1)
                                .attr("fill", "blue")
                                .attr("fill-opacity", .2)
                            break
                        }
    
                        tries++
                    }
                }
    
                for (var j = 0; j < black_pop; j++) {
                    var tries = 1
    
                    while (true) {
                        var x = Math.round(x0 + Math.random() * w),
                            y = Math.round(y0 + Math.random() * h)
    
                        var r = Math.floor(i / 256),
                            g = i % 256
    
                        var index = (x + y * self.width) * 4
    
                        var actual_r = pixels[index],
                            actual_g = pixels[index + 1]
    
                        var contains = actual_r == r && actual_g == g
                        if (contains) {
                            svg.append("circle")
                                .attr("cx", x)
                                .attr("cy", y)
                                .attr("r", 1)
                                .attr("fill", "red")
                                .attr("fill-opacity", .2)
                            break
                        }
    
                        tries++
                    }
                }
            }
        });

    }


    drawPolygon(coordinates, fill, context, projection) {
        context.fillStyle = fill
        context.beginPath();
        coordinates.forEach(function (ring) {
            ring.forEach(function (coord, i) {
                var projected = projection(coord);
                if (i == 0) {
                    context.moveTo(projected[0], projected[1])
                } else {
                    context.lineTo(projected[0], projected[1])
                }
            })
        })
        context.closePath()
        context.fill()
    }

    
}