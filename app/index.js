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
var d3 = require("d3");
var topojson = require("topojson");
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
    function Meteorite(radius, latitude, longitude, name, year, fall, nametype) {
    }
    return Meteorite;
}());
var MappedLandingsChart = (function () {
    function MappedLandingsChart() {
    }
    MappedLandingsChart.prototype.fetchData = function () {
        // let data:Meteorite[] = [];
        // d3.json(SERVICE_URL, (d) => {
        //     d.features.forEach(f => {
        //       data.push(new Meteorite(d.properties.mass, d.properties.reclat, d.properties.reclong, d.properties.name, new Date(d.propertites.year),
        //         d.properities.fall, d.properties.nametype
        //       ));
        //     });
        // });
        //this.createChart(data);
    };
    MappedLandingsChart.prototype.createChart = function () {
        var margin = new Margin(35, 40, 180, 120);
        var height = 650 - margin.top - margin.bottom;
        var width = 1300 - margin.left - margin.right;
        var svgChart = d3.select("#chart")
            .append("svg")
            .style("background", "#FFF")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
        var projection = d3.geoMercator()
            .translate([width / 2, height / 2])
            .scale(500);
        var path = d3.geoPath().projection(projection);
        d3.queue()
            .defer(d3.json, TOPO_JSON)
            .defer(d3.json, SERVICE_URL)
            .await(function (error, data, meteorites) {
            var countries = topojson.feature(data, data.objects.countries).features;
            svgChart.selectAll("path").data(countries).enter().append("path").attr("d", path);
            var meteors = [];
            meteorites.features.forEach(function (f) {
                meteors.push(new Meteorite(f.properties.mass, f.properties.reclat, f.properties.reclong, f.properties.name, new Date(f.properties.year), f.properties.fall, f.properties.nametype));
            });
            svgChart.selectAll("circle").data(meteors).enter().append("circle").attr("cx", 10);
        });
        // //draw bubbles for bombs 
        // bombMap.bubbles(data, {
        //     popupTemplate: function (geo, data) {
        //             return ['<div class="hoverinfo">' +  data.name,
        //             '<br/>Payload: ' +  data.yield + ' kilotons',
        //             '<br/>Country: ' +  data.country + '',
        //             '<br/>Date: ' +  data.date + '',
        //             '</div>'].join('');
        //     }
        // });
    };
    return MappedLandingsChart;
}());
var landingMap = new MappedLandingsChart();
landingMap.createChart();
