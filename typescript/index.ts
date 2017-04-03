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
import * as sprintf_js from 'sprintf-js';

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
  mass:number;
  latitude: number;
  longitude: number;
  name: string;
  year: Date;
  fall: string;
  nametype: string;
  classType:string;
  color:string;
  constructor(properties:any)
  {
    this.mass = properties.mass;
    this.latitude = properties.reclat;
    this.longitude = properties.reclong;
    this.name = properties.name;
    this.year = new Date(properties.year);
    this.fall = properties.fall;
    this.nametype = properties.nametype;
    this.classType = properties.recclass;
  }
  getRadius()
  {
    if (this.mass < 62500) 
    {
      return 1;
    } 
    else if (this.mass <= 125000)
    {
      return 2;
    }
    else if (this.mass <= 250000)
    {
      return 4;
    } 
    else if (this.mass <= 500000)
    {
      return 8;
    }
    else if (this.mass <= 2000000)
    {
      return 16;
    } 
    else if (this.mass <= 4000000)
    {
      return 32;
    }
    return 64;
  }
}
class MappedLandingsChart 
{
  createChart() {
    let margin = new Margin(35, 40, 180, 120);
    let height = 650 - margin.top - margin.bottom;
    let width = 1300 - margin.left - margin.right;
    let svgChart = d3.select("#chart")
            .append("svg")
            .style("background", "steelblue")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

     let g = svgChart.append("g");

     let projection = d3.geoMercator()
      .translate([width / 2, height / 2])
      .scale(300);

     let path = d3.geoPath().projection(projection);
     
     d3.queue()
     .defer(d3.json, TOPO_JSON)
     .defer(d3.json, SERVICE_URL)
     .await((error, data, meteorites) => {
        let countries = topojson.feature(data, data.objects.countries).features;
        
        this.drawCountries(g, countries, path)
        
        let meteors:Meteorite[] = [];
         meteorites.features.forEach(f => {
           meteors.push(new Meteorite(f.properties));
         });

         meteors.sort((a:Meteorite, b:Meteorite) => 
         {
           return b.mass-a.mass;
         });
        debugger;
        this.drawMeteorites(g, meteors, projection);
     });

     var zoom = d3.zoom()
        .on("zoom",() => {
          g.attr("transform", d3.event.transform.toString())
          g.selectAll("path")  
              .attr("d", path.projection(projection)); 
        });
        
        svgChart.call(zoom);
  }
  drawCountries(g:any, countries:any[], path:topojson.GeoPath)
  {
    g.selectAll("path")
        .data(countries)
        .enter()
        .append("path")
        .style("fill", "Aquamarine")
        .style("stroke", "SteelBlue")
        .style("stroke-width", ".5px")
        .attr("d", path);
  }
  drawMeteorites(g:any, meteors:Meteorite[], projection:d3.GeoProjection)
  {
      let tooltip = Tooltip.get();
      let timeFormat = d3.timeFormat("%Y-%m-%d");
      let colors = ["MediumPurple","Red","Yellow","Orange","SpringGreen","Blue","Cyan"];
      
      g.selectAll("circle")
      .data(meteors)
      .enter()
      .append("circle")
      .attr("r", (m:Meteorite) => 
      {
        return m.getRadius();
      })
      .style("fill", (m:Meteorite) => {
        m.color = colors[Math.floor(Math.random() * ((colors.length - 1)  - 0 + 1)) + 0];
        return m.color;
      })
      .style("opacity", (m:Meteorite) => {
        return m.mass > 125000 ? .5 : 1;
      })
      .style("stroke-width", ".5px")
      .style("stroke", "white")
      .attr("cx", (m:Meteorite) =>
      {
        return projection([m.longitude, m.latitude])[0];
      }
      ).attr("cy", (m:Meteorite) =>
      {
        return projection([m.longitude, m.latitude])[1];
      })
      .on("mouseover", (m:Meteorite) => 
      { 
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
      .on("mouseout", () => 
      {   
        d3.select(d3.event.currentTarget)
            .style("fill", (m:Meteorite) => 
            {
              return m.color;
            });

          tooltip
          .transition()
          .duration(500)
          .style("opacity", 0);
      });
    }
  }
class Tooltip
{
    static get():any
    {
       return d3.select("#tooltip")
            .append("div")
            .style("pointer-events", "none")
            .style("position", "absolute")
            .style("padding", "10px")
            .style("background", "white")
            .style("color", "black")
            .style("width", "250px")
            .style("opacity", 0);
    }

    static getText(meteorite:Meteorite, timeFormat:any):string
    {
     
        return sprintf_js.sprintf("Fall: %s<br/>Mass: %s<br/>Name: %s<br/>Name Type: %s<br/>" +
        "Class:  %s<br/>Latitude:  %s<br/>Year: %s", 
            meteorite.fall, meteorite.mass, meteorite.name, meteorite.nametype, 
            meteorite.classType, meteorite.latitude, timeFormat(meteorite.year));
    }
}
let landingMap = new MappedLandingsChart();
landingMap.createChart();