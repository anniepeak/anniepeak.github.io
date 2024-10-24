// Load the data
const iris = d3.csv("iris.csv");

// Once the data is loaded, proceed with plotting
iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define the dimensions and margins for the SVG
    const margin = {top: 50, right: 50, bottom: 50, left: 50};
    const width = 500 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;


    // Create the SVG container
    const svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // Set up scales for x and y axes
    // d3.min(data, d => d.bill_length_mm)-5
    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength) - 0.5, d3.max(data, d => d.PetalLength) + 0.5])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalWidth) - 0.5, d3.max(data, d => d.PetalWidth) + 0.5])
        .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.Species))
        .range(d3.schemeCategory10);

    // Add scales     
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add circles for each data point
    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => xScale(d.PetalLength))
        .attr("cy", d => yScale(d.PetalWidth))
        .attr("r", 5)
        .style("fill", d => colorScale(d.Species));


    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Petal Length");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 10)
        .attr("text-anchor", "middle")
        .text("Petal Width");

    // Add legend
    const legend = svg.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legend.append("rect")
        .attr("x", width - 18)
        .attr("y", 9)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", colorScale);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 18)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d);
});

iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
    });

    // Define the dimensions and margins for the SVG
    const marginBoxplot = {top: 50, right: 50, bottom: 50, left: 50};
    const widthBoxplot = 500 - marginBoxplot.left - marginBoxplot.right;
    const heightBoxplot = 400 - marginBoxplot.top - marginBoxplot.bottom;


    // Create the SVG container
    const svgBoxplot = d3.select("body").append("svg")
        .attr("width", widthBoxplot + marginBoxplot.left + marginBoxplot.right)
        .attr("height", heightBoxplot + marginBoxplot.top + marginBoxplot.bottom)
        .append("g")
        .attr("transform", "translate(" + marginBoxplot.left + "," + marginBoxplot.top + ")");

    // Set up x and y scales for boxplot
    const xScaleBoxplot = d3.scaleBand()
        .domain(["setosa", "versicolor", "virginica"])
        .range([0, widthBoxplot])
        .padding(0.2);
    const yScaleBoxplot = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength) - 0.5, d3.max(data, d => d.PetalLength) + 0.5])
        .range([heightBoxplot, 0]);


    // Add scales     
    svgBoxplot.append("g")
        .attr("transform", "translate(0," + heightBoxplot + ")")
        .call(d3.axisBottom(xScaleBoxplot));

    // Add x-axis label
    svgBoxplot.append("text")
        .attr("x", widthBoxplot / 2)
        .attr("y", heightBoxplot + marginBoxplot.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Species");

    svgBoxplot.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -heightBoxplot / 2)
        .attr("y", -marginBoxplot.left + 10)
        .attr("text-anchor", "middle")
        .text("Petal Length")


    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.PetalLength).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const IQR = q3 - q1; // Interquartile range
        const lowerBound = q1 - 1.5 * IQR;
        const upperBound = q3 + 1.5 * IQR;
        return { q1, median, q3, lowerBound, upperBound };
    };
    
    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    quartilesBySpecies.forEach((quartiles, Species) => {
        const x = xScale(Species);
        const boxWidth = xScale.bandwidth();

        // Draw vertical lines
        svgBoxplot.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScaleBoxplot(quartiles.lowerBound))
            .attr("y2", yScaleBoxplot(quartiles.upperBound))
            .attr("stroke", "black");
        
        // Draw box
        svgBoxplot.append("rect")
            .attr("x", x)
            .attr("y", yScaleBoxplot(quartiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScaleBoxplot(quartiles.q1) - yScaleBoxplot(quartiles.q3))
            .attr("fill", "lightblue")
            .attr("stroke", "black");
        
        // Draw median line
         svgBoxplot.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScaleBoxplot(quartiles.median))
            .attr("y2", yScaleBoxplot(quartiles.median))
            .attr("stroke", "black");
        
    });
});
