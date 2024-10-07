

const width = 1000;
const height = 600;
const svg = d3.select('body')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style("position", "absolute")  
        .style("left", "50%")        
        .style("top", "50%")     
        .style("transform", "translate(-50%, -50%)")
        .style("background-color", "white");

        svg.append("text")
                .attr("x", width / 2)
                .attr("y", height / 2)
                .attr("text-anchor", "middle") // Center the text
                .attr("font-family", "Arial")
                .attr("font-size", "30px")
                .attr("fill", "black")
                .text("NO CHART. DID NOT CONTRIBUTE TO TEAM WORK");