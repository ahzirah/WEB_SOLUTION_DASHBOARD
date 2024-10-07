    // **************************************************************************************
    //                                        AN ADAPTATION 
    // **************************************************************************************


d3.json("bubbles_world.json")
    .then(buildBubbleChart)
    .catch(function (error){
        console.log("Error Reading from file: " + error);
    })
function buildBubbleChart(jsonData){

    // ***************************************
    //       DEFINING DIMENSIONS
    // ***************************************
    const width = 950;
    const height = 550;
    const leftmargin = 100;
    const rightmargin = 120;
    const bottommargin = 50;
    const topmargin = 50;

    // **********************************************************
    //  CREATING THE SVG AND BINDING IT TO THE BODY OF THE PAGE
    // **********************************************************
    const svg = d3.select("body")
                  .append("svg")
                  .attr("id", "bubbleSVG")
                  .attr("width", width + leftmargin + rightmargin)
                  .attr("height", height + topmargin + bottommargin)
                  .style("position", "absolute")  
                  .style("left", "50%")        
                  .style("top", "50%")     
                  .style("background-color", "white")
                  .style("transform", "translate(-50%, -50%)")
                  .append("g")
                  .attr("transform", "translate(" + leftmargin + "," + topmargin + ")")
                  
    // Function to format numbers in "1k" format
    function formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num;
    }
                  
    document.getElementById("bubbleSVG").addEventListener("click", function(event) {
    const isBubble = event.target.nodeName === "circle";
             // If the click was on a bubble, handle the click as before
   if (isBubble) {
       handleClick(event, d3.select(event.target).datum());
   } else {
            // If the click was on empty space, reverse the animation of all bubbles
      svg.selectAll("circle").each(function() {
         const bubble = d3.select(this);
         const originalSize = bubble.datum().total_product_price/2;
         bubble.transition().duration(1000)
               .attr("r", z(originalSize))
               .attr("stroke-width", 1.3);
               bubble.style("opacity", 0.7);  });
             }
   });

    const quantity = jsonData.map(function(d) {return d.total_quantity_sold});
    const salesprice = jsonData.map(function(d) {return d.total_sales_price});
    const productprice = jsonData.map(function(d) {return d.total_product_price});
    const maximumQuantity = d3.max(quantity);
    const maximumSalesPrice = d3.max(salesprice);
    const maximumProductPrice = d3.max(productprice);

  
    // ***************************************
    //        THE X AXIS
    // ***************************************
    const x = d3.scaleLinear()
        .domain([0, maximumSalesPrice+500])
        .range([0, width - leftmargin ])
        .nice();
    svg.append("g")
        .classed("axis", true)
        .attr("transform", "translate(0," + (height - bottommargin) + ")")
        .call(d3.axisBottom(x).ticks(10));
    svg.append("text")
        .attr("x", width/2)
        .attr("y", height + topmargin - 50)
        .text("Total Sum of Sales Price");

    // ***************************************
    //       THE Y AXIS
    // ***************************************
    const y = d3.scaleLinear()
        .domain([maximumQuantity+50, 0])
        .range([ topmargin, height - bottommargin])
        .nice();   
    svg.append("g")
        .classed("axis", true)
        .attr("transform", "translate(0" + ",0)")
        .call(d3.axisLeft(y).ticks(10))
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2)) 
        .attr("y", -leftmargin + 50)
        .text("Sum of All Product Categorys")
        

    // ***************************************
    //       BUBBLE CREATION
    // ***************************************

    const z = d3.scaleLinear()
                .domain([0, maximumProductPrice])
                .range([ 15, 70]);

    const myColor = d3.scaleOrdinal()
        .domain(["Asia", "Europe", "South America", "North America", "Africa", "Oceania", "Antartica"]) 
        .range(["#ff7f0e", "#1f77b4", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#bcbd22"]); 

    const bubbles = svg.selectAll("bubble")
            .data(jsonData)
            .enter()
            .append("g")
            .classed("bubble", true);

    bubbles.append("circle")
        .attr("cx", function (d) { return x(d.total_sales_price); } )
        .attr("cy", function (d) { return y(d.total_quantity_sold); } )
        .attr("r", function (d) { return z(d.total_product_price)/2; } )
        .style("fill", function (d) { return myColor(d.continent); } )
        .style("opacity", "0.7")
        .attr("stroke", "black")
        .attr("stroke-width", 1.3)
        .on("click", handleClick)
        .on("mouseover", function(event, d) {
            if (d3.select(this).style("opacity") !== "0") {


    // ***************************************
    //         TOOLTIPS
    // ***************************************
    const tooltip = d3.select("body")
                        .append("div")
                        .classed("tooltip", true)
                        .style("position", "absolute")
                        .style("padding", "10px")
                        .style("background-color", "rgba(10, 15, 18, 0.8)")
                        .style("color", "white")
                        .style("border-radius", "10px")
                        .style("pointer-events", "none")
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 20) + "px");
        d3.select(this)
            .attr("stroke-width", 2)
            .attr("stroke", "black");
                tooltip.html(`Country: ${d.country}<br>Continent: ${d.continent}<br>Quantity: ${d.total_quantity_sold}<br>Sales Price:  ${formatNumber(d.total_sales_price)}`)
                    .transition()
                    .duration(200)
                    .style("opacity", 0.9);
            }
        })
        .on("mouseout", function(event, d) {
            if (d3.select(this).style("opacity") !== "0") {
                d3.select(this)                                
                  .attr("stroke-width", 1)
                  .attr("stroke", "black")
                  .style("fill", function(d) { return myColor(d.continent); });
                d3.selectAll(".tooltip")
                  .remove(); 
            }
        })

    // ***************************************
    //        BUBBLE ANIMATION
    // ***************************************     
    function handleClick(event, d) {

        // Restore opacity of all bubbles
        svg.selectAll("circle").style("opacity", 0.4);
        // increase opacity of clicked bubble
        d3.select(event.target).style("opacity", 1);
        d3.select(event.target).transition().duration(1000)
        .attr("r", function (d) { 
            return z(d.total_product_price) * 1.2; }
        )
        .attr("stroke-width", 1.8); 
     }

    // ***************************************
    //       BUBBLE LABELLING
    // ***************************************
        bubbles.append("text")
        .attr("x", function (d) { return x(d.total_sales_price); } )
        .attr("y", function (d) { return y(d.total_quantity_sold); } )
        .attr("dy", ".35em")
        .text(function(d) {return d.country;})
        .style("font-size", "15px")
        .style("text-anchor", "middle")
        .style("fill", "black")


    // ***************************************
    //             LEGEND
    // ***************************************
     const legendData = ["Asia", "Europe", "South America", "North America", "Africa", "Oceania", "Antartica"];
     const legendContainer = svg.append("g")
                .attr("class", "legend-container")
                .attr("transform", "translate(" + (width ) + "," + (topmargin + 20) + ")");

        const legend = legendContainer.append("g")
                .classed("legend", true);

            legend.selectAll(".legend-item")
                .data(["World"].concat(legendData))
                .enter()
                .append("g")
                .classed("legend-item", true)
                .attr("transform", function(d, i) {
                    return "translate(0," + (i * 20) + ")";
                })
        .on("click", function(event, d) {
            if (d === "World") {
                svg.selectAll(".bubble").style("display", "block");
            } else {
                svg.selectAll(".bubble")
                    .style("display", function(data) {
                        return d === "All" || data.continent === d ? "block" : "none";
                    });
            }
        })
            .on("mouseover", function(event, d) {
                if (d !== "World") {
                    svg.selectAll("circle")
                        .style("opacity", function(data) {
                            return d === "All" || data.continent === d ? 1 : 0.2;
                        });
                }
            })
                .on("mouseout", function() {
                    // Restore opacity of bubbles on mouseout
                    svg.selectAll("circle")
                        .style("opacity", 0.7);
                });

            legend.selectAll(".legend-item")
            .html(function(d) {
                return `<circle class="legend-circle" cx="0" cy="0" r="5" fill="${d === "World" ? "black" : myColor(d)}"></circle><text class="legend-text" x="10" y="5">${d}</text>`;
        });

    };
