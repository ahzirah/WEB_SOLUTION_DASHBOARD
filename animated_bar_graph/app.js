
        
      const svg = d3.select("#chart-svg");
      const margin = { top: 40, right: 100, bottom: 40,left:100};
      const width = 1100 - margin.left - margin.right;
      const height = 700 - margin.top - margin.bottom;
      const Duration = 1000; // Transition duration in milliseconds

      d3.json("bar-data.json").then(data => {
          // Aggregate data to calculate total quantity sold for each category
          const categoryTotals = {};
          data.forEach(d => {
              if (!categoryTotals[d.ProductCategory]) {
                  console.log(categoryTotals[d.ProductCategory]);
                  categoryTotals[d.ProductCategory] = 0;
              }
              categoryTotals[d.ProductCategory] += d.QuantitySold;
          });

          const maxQuantity = d3.max(Object.values(categoryTotals)); // Maximum quantity sold for scaling
          const topCategories = getTopCategories(categoryTotals, 10);
          const filteredData = data.filter(d => topCategories.includes(d.ProductCategory));
          buildAnimatedBarChart(filteredData, maxQuantity);
      }).catch(error => {
          console.error("Error loading data:", error);
      });

      function getTopCategories(categoryTotals, numCategories) {
          // Sort categories by total quantity sold and get top categories
          const sortedCategories = Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a]);
          return sortedCategories.slice(0, numCategories);
      }

      function buildAnimatedBarChart(data, maxQuantity) {
          const categories = [...new Set(data.map(d => d.ProductCategory))];
          const years = Array.from({ length: 5 }, (_, i) => 2016 + i); // Start from 2016 to 2020
          let currentYearIndex = 0;
          // Define a color scale for categories
          const colorScale = d3.scaleOrdinal()
              .domain(categories)
              .range(d3.schemeCategory10); // You can use any color scheme

          const x = d3.scaleLinear()
              .domain([0, 15])
              .range([margin.left, width - margin.right]);
              
          const y = d3.scaleBand()
              .domain(categories)
              .range([margin.top, height - margin.bottom])
              .padding(0.1);

          // Append bars
          svg.selectAll(".bar")
              .data(data.filter(d => d.OrderYear === years[currentYearIndex]))
              .enter()
              .append("rect")
              .attr("class", "bar")
              .attr("fill", d => colorScale(d.ProductCategory))
              .attr("x", margin.left)
              .attr("y", d => y(d.ProductCategory))
              .attr("height", y.bandwidth());

          // Append labels to bars
          svg.selectAll(".label")
              .data(data.filter(d => d.OrderYear === years[currentYearIndex]))
              .enter()
              .append("text")
              .attr("class", "label")
              .attr("x", d => margin.left + 5) // Adjust this position as needed
              .attr("y", d => y(d.ProductCategory) + y.bandwidth() / 1.5)
              

          function updateBars(yearIndex) {
              currentYearIndex = yearIndex;
              const filteredData = data.filter(d => d.OrderYear === years[currentYearIndex]);
              svg.selectAll(".bar")
                  .data(filteredData, d => d.ProductCategory)
                  .transition()
                  .duration(Duration)
                  .attr("width", d => d.QuantitySold*47);
              // Update labels position
              svg.selectAll(".label")
                  .data(filteredData, d => d.ProductCategory)
                  .transition()
                  .duration(Duration)
                  .attr("x", d => x(d.QuantitySold) + 10) // Adjust this position as needed
                  .text(d => d.QuantitySold);
              // Update year text
              svg.select(".year-text").text(`Year: ${years[currentYearIndex]}`);
          }

          function animateChart() {
              const animationInterval = setInterval(() => {
                  updateBars(currentYearIndex);
                  currentYearIndex = (currentYearIndex + 1) % years.length;
                  if (currentYearIndex === 0) {
                      clearInterval(animationInterval); // Stop animation at the end
                  }
              }, Duration + 2000); // Add extra delay for smoother transition
          }

          // Display current year
          svg.append("text")
              .attr("class", "year-text")
              .attr("x", width / 2)
              .attr("y", margin.top / 2)
              .attr("text-anchor", "middle")
              .text(`Year: ${years[currentYearIndex]}`);

          // Add X axis
          svg.append("g")
              .attr("transform", `translate(0, ${height - margin.bottom})`)
              .call(d3.axisBottom(x));

          

           //Create X axis label   
          svg.append("text")
          .attr("x", width / 2 )
          .attr("y",  height + margin.bottom)
          .style("text-anchor", "middle")
          .text("Quantity Sold");

          // Add Y axis
          svg.append("g")
              .attr("transform", `translate(${margin.left}, 0)`)
              .call(d3.axisLeft(y));

          //Create Y axis label
          svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0+25)
          .attr("x",0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Products"); 
          // Start animation
          animateChart();
      }
  