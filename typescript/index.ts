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

import * as d3 from 'd3';
import * as topojson from 'topojson';

const SERVICE_URL = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json";
const TOPO_JSON = "https://d3js.org/world-110m.v1.json";

class Margin {
    top: number;
    right: number;
    bottom: number;
    left: number;

    constructor(top:number, right:number, bottom:number, left:number)
    {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left= left;
    }    
}
class Meteorite {
  radius:number;
  latitude: number;
  longitude: number;
  name: string;
  year: Date;
  fall: string;
  nametype: string;

  constructor(radius:number, latitude:number, longitude:number, name:string, year:Date, fall:string, nametype:string)
  {

  }
}
class MappedLandingsChart {
  fetchData() {
    // let data:Meteorite[] = [];

    // d3.json(SERVICE_URL, (d) => {
    //     d.features.forEach(f => {
    //       data.push(new Meteorite(d.properties.mass, d.properties.reclat, d.properties.reclong, d.properties.name, new Date(d.propertites.year),
    //         d.properities.fall, d.properties.nametype
    //       ));
    //     });
    // });
    //this.createChart(data);
  }

  createChart() {
    let margin = new Margin(35, 40, 180, 120);
    let height = 650 - margin.top - margin.bottom;
    let width = 1300 - margin.left - margin.right;
    let svgChart = d3.select("#chart")
            .append("svg")
            .style("background", "#FFF")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

     let projection = d3.geoMercator()
      .translate([width / 2, height / 2])
      .scale(500);

     let path = d3.geoPath().projection(projection);
    
     d3.queue()
     .defer(d3.json, TOPO_JSON)
     .defer(d3.json, SERVICE_URL)
     .await((error, data, meteorites) => {
        let countries = topojson.feature(data, data.objects.countries).features;
        svgChart.selectAll("path").data(countries).enter().append("path").attr("d", path);
    
        let meteors = [];
         meteorites.features.forEach(f => {
           meteors.push(new Meteorite(f.properties.mass, f.properties.reclat, f.properties.reclong, 
              f.properties.name, new Date(f.properties.year),
              f.properties.fall, f.properties.nametype
           ));
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
  }


}
let landingMap = new MappedLandingsChart();
landingMap.createChart();