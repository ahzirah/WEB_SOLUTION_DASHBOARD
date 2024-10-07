d3.json("treedata.json").then(function(data) {
    const colorScale = d3.scaleOrdinal(d3.schemeSet3);
    const width = 1400;
    const height = 700;
    const svg = d3.select('body')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style("position", "absolute")
        .style("left", "50%")
        .style("top", "60%")
        .style("transform", "translate(-50%, -50%)")
        .style("background-color", "white");

    // Function to format numbers in "1k" format
    function formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num;
    }

    function updateChart(selectedGender) {
        // Filter the data
        const filteredData = selectedGender === "All" ? data : data.children.find(d => d.name === selectedGender);
    
        // Setup the treemap layout dynamically based on the filtered data
        const treemap = d3.treemap()
            .size([width, height])
            .padding(1)
            .round(true);
    
        const root = d3.hierarchy(filteredData)
            .sum(d => d.value)
            .sort((a, b) => b.height - a.height || b.value - a.value);
    
        treemap(root);
    
        const cell = svg.selectAll("g")
            .data(root.leaves(), d => d.data.name);
    
        cell.exit().remove();
    
        const cellEnter = cell.enter().append("g")
            .attr("transform", d => `translate(${d.x0},${d.y0})`)
            .on("click", function(d) {
                const clicked = !d3.select(this).classed("clicked");
                svg.selectAll("g").classed("clicked", false); // Reset clicked state for all cells
                svg.selectAll("g").style("opacity", clicked ? 0.3 : 1); // Set opacity based on clicked state
                d3.select(this).classed("clicked", clicked); // Set clicked state for the clicked cell
                d3.select(this).style("opacity", 1); // Keep opacity 1 for the clicked cell
            });
    
        cellEnter.append("rect")
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => colorScale(d.data.name))
            .append("title") // Add title element for tooltip
            .text(d => `${d.data.name}: ${formatNumber(d.data.value)}`); // Tooltip text
    
        cellEnter.append("text")
            .attr("x", 5)
            .attr("y", 35)
            .text(d => `${d.data.name}: ${formatNumber(d.data.value)}`); // Display the same text as tooltip
    
        // Merge new and updating cells
        cellEnter.merge(cell)
            .attr("transform", d => `translate(${d.x0},${d.y0})`)
            .select("rect")
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .select("title") // Update title text
            .text(d => `${d.data.name}: ${formatNumber(d.data.value)}`); // Tooltip text
    
        cellEnter.merge(cell)
            .select("text")
            .attr("x", 5)
            .attr("y", 20)
            .text(d => `${d.data.name}: ${formatNumber(d.data.value)}`); // Display the same text as tooltip
    }
    
    
    // Dropdown for gender selection
    const dropdown = d3.select(".gender-select")
        .style('position', 'absolute')
        .style('top', 350)
        .style('left', '20%')
        .append('select')
        .on("change", function() {
            updateChart(this.value);
        });

    dropdown.selectAll("option")
        .data(["All", "Female", "Male"])
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);

    // Initial chart rendering
    updateChart("All");

}).catch(function(error) {
    console.error('Error loading the data: ', error);
});