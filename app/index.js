//http://www.d3noob.org/2013/03/a-simple-d3js-map-explained.html
//https://www.youtube.com/watch?v=aNbgrqRuoiE&t=178s
/*
"type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          6.08333,
          50.775
        ]
      },
      "properties": {
        
      }
    },
*/
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var d3 = require("d3");
var topojson = require("topojson");
var sprintf_js = require("sprintf-js");
var SERVICE_URL = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json";
var TOPO_JSON = "https://d3js.org/world-110m.v1.json";
var Margin = (function () {
    function Margin(top, right, bottom, left) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }
    return Margin;
}());
var Meteorite = (function () {
    function Meteorite(properties) {
        this.mass = properties.mass;
        this.latitude = properties.reclat;
        this.longitude = properties.reclong;
        this.name = properties.name;
        this.year = new Date(properties.year);
        this.fall = properties.fall;
        this.nametype = properties.nametype;
        this.classType = properties.recclass;
    }
    Meteorite.prototype.getRadius = function () {
        if (this.mass < 62500) {
            return 1;
        }
        else if (this.mass <= 125000) {
            return 2;
        }
        else if (this.mass <= 250000) {
            return 4;
        }
        else if (this.mass <= 500000) {
            return 8;
        }
        else if (this.mass <= 2000000) {
            return 16;
        }
        else if (this.mass <= 4000000) {
            return 32;
        }
        return 64;
    };
    return Meteorite;
}());
var MappedLandingsChart = (function () {
    function MappedLandingsChart() {
    }
    MappedLandingsChart.prototype.createChart = function () {
        var _this = this;
        var margin = new Margin(35, 40, 180, 120);
        var height = 650 - margin.top - margin.bottom;
        var width = 1300 - margin.left - margin.right;
        var svgChart = d3.select("#chart")
            .append("svg")
            .style("background", "steelblue")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
        var g = svgChart.append("g");
        var projection = d3.geoMercator()
            .translate([width / 2, height / 2])
            .scale(300);
        var path = d3.geoPath().projection(projection);
        d3.queue()
            .defer(d3.json, TOPO_JSON)
            .defer(d3.json, SERVICE_URL)
            .await(function (error, data, meteorites) {
            var countries = topojson.feature(data, data.objects.countries).features;
            _this.drawCountries(g, countries, path);
            var meteors = [];
            meteorites.features.forEach(function (f) {
                meteors.push(new Meteorite(f.properties));
            });
            meteors.sort(function (a, b) {
                return b.mass - a.mass;
            });
            debugger;
            _this.drawMeteorites(g, meteors, projection);
        });
        var zoom = d3.zoom()
            .on("zoom", function () {
            g.attr("transform", d3.event.transform.toString());
            g.selectAll("path")
                .attr("d", path.projection(projection));
        });
        svgChart.call(zoom);
    };
    MappedLandingsChart.prototype.drawCountries = function (g, countries, path) {
        g.selectAll("path")
            .data(countries)
            .enter()
            .append("path")
            .style("fill", "Aquamarine")
            .style("stroke", "SteelBlue")
            .style("stroke-width", ".5px")
            .attr("d", path);
    };
    MappedLandingsChart.prototype.drawMeteorites = function (g, meteors, projection) {
        var tooltip = Tooltip.get();
        var timeFormat = d3.timeFormat("%Y-%m-%d");
        var colors = ["MediumPurple", "Red", "Yellow", "Orange", "SpringGreen", "Blue", "Cyan"];
        g.selectAll("circle")
            .data(meteors)
            .enter()
            .append("circle")
            .attr("r", function (m) {
            return m.getRadius();
        })
            .style("fill", function (m) {
            m.color = colors[Math.floor(Math.random() * ((colors.length - 1) - 0 + 1)) + 0];
            return m.color;
        })
            .style("opacity", function (m) {
            return m.mass > 125000 ? .5 : 1;
        })
            .style("stroke-width", ".5px")
            .style("stroke", "white")
            .attr("cx", function (m) {
            return projection([m.longitude, m.latitude])[0];
        }).attr("cy", function (m) {
            return projection([m.longitude, m.latitude])[1];
        })
            .on("mouseover", function (m) {
            d3.select(d3.event.currentTarget)
                .style("fill", "Black");
            tooltip.transition()
                .duration(200)
                .style("opacity", .7);
            tooltip.html(Tooltip.getText(m, timeFormat));
            tooltip.style("left", d3.event.pageX.toString() + "px")
                .style("top", d3.event.pageY.toString() + "px");
            d3.select(d3.event.currentTarget)
                .style("cursor", "pointer");
        })
            .on("mouseout", function () {
            d3.select(d3.event.currentTarget)
                .style("fill", function (m) {
                return m.color;
            });
            tooltip
                .transition()
                .duration(500)
                .style("opacity", 0);
        });
    };
    return MappedLandingsChart;
}());
var Tooltip = (function () {
    function Tooltip() {
    }
    Tooltip.get = function () {
        return d3.select("#tooltip")
            .append("div")
            .style("pointer-events", "none")
            .style("position", "absolute")
            .style("padding", "10px")
            .style("background", "white")
            .style("color", "black")
            .style("width", "250px")
            .style("opacity", 0);
    };
    Tooltip.getText = function (meteorite, timeFormat) {
        return sprintf_js.sprintf("Fall: %s<br/>Mass: %s<br/>Name: %s<br/>Name Type: %s<br/>" +
            "Class:  %s<br/>Latitude:  %s<br/>Year: %s", meteorite.fall, meteorite.mass, meteorite.name, meteorite.nametype, meteorite.classType, meteorite.latitude, timeFormat(meteorite.year));
    };
    return Tooltip;
}());
var landingMap = new MappedLandingsChart();
landingMap.createChart();
