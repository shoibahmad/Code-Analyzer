// Code Complexity Visualization using D3.js
// Creates interactive visualizations of code complexity

class ComplexityVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.width = 800;
        this.height = 600;
        this.svg = null;
    }

    init() {
        if (!this.container) return;

        // Clear container
        this.container.innerHTML = '';

        // Create SVG
        this.svg = d3.select(`#${this.container.id}`)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');
    }

    // Create complexity heatmap
    createHeatmap(data) {
        this.init();

        const margin = { top: 50, right: 30, bottom: 70, left: 100 };
        const width = this.width - margin.left - margin.right;
        const height = this.height - margin.top - margin.bottom;

        const g = this.svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Sample data structure: [{metric: 'Complexity', value: 8}, ...]
        const metrics = data.map(d => d.metric);
        const maxValue = d3.max(data, d => d.value) || 10;

        // Create scales
        const xScale = d3.scaleBand()
            .domain(metrics)
            .range([0, width])
            .padding(0.1);

        const colorScale = d3.scaleLinear()
            .domain([0, maxValue / 2, maxValue])
            .range(['#10b981', '#f59e0b', '#ef4444']);

        // Create bars
        g.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.metric))
            .attr('y', d => height - (d.value / maxValue) * height)
            .attr('width', xScale.bandwidth())
            .attr('height', d => (d.value / maxValue) * height)
            .attr('fill', d => colorScale(d.value))
            .attr('rx', 4)
            .on('mouseover', function (event, d) {
                d3.select(this).attr('opacity', 0.7);
                showTooltip(event, d);
            })
            .on('mouseout', function () {
                d3.select(this).attr('opacity', 1);
                hideTooltip();
            });

        // Add value labels
        g.selectAll('.label')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', d => xScale(d.metric) + xScale.bandwidth() / 2)
            .attr('y', d => height - (d.value / maxValue) * height - 10)
            .attr('text-anchor', 'middle')
            .attr('fill', '#fff')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .text(d => d.value);

        // Add X axis
        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll('text')
            .attr('fill', '#94a3b8')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');

        // Add title
        this.svg.append('text')
            .attr('x', this.width / 2)
            .attr('y', 30)
            .attr('text-anchor', 'middle')
            .attr('fill', '#fff')
            .attr('font-size', '18px')
            .attr('font-weight', 'bold')
            .text('Code Complexity Metrics');

        function showTooltip(event, d) {
            const tooltip = d3.select('body').append('div')
                .attr('class', 'complexity-tooltip')
                .style('position', 'absolute')
                .style('background', 'rgba(15, 23, 42, 0.95)')
                .style('color', '#fff')
                .style('padding', '10px')
                .style('border-radius', '8px')
                .style('border', '1px solid rgba(59, 130, 246, 0.5)')
                .style('pointer-events', 'none')
                .style('z-index', '10000')
                .html(`<strong>${d.metric}</strong><br/>Value: ${d.value}/10`);

            tooltip
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        }

        function hideTooltip() {
            d3.selectAll('.complexity-tooltip').remove();
        }
    }

    // Create radial complexity chart
    createRadialChart(data) {
        this.init();

        const radius = Math.min(this.width, this.height) / 2 - 40;
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        const g = this.svg.append('g')
            .attr('transform', `translate(${centerX},${centerY})`);

        // Create scales
        const angleScale = d3.scaleLinear()
            .domain([0, data.length])
            .range([0, 2 * Math.PI]);

        const radiusScale = d3.scaleLinear()
            .domain([0, 10])
            .range([0, radius]);

        // Create radial grid
        const gridLevels = [2, 4, 6, 8, 10];
        gridLevels.forEach(level => {
            g.append('circle')
                .attr('r', radiusScale(level))
                .attr('fill', 'none')
                .attr('stroke', 'rgba(148, 163, 184, 0.2)')
                .attr('stroke-width', 1);

            g.append('text')
                .attr('x', 5)
                .attr('y', -radiusScale(level))
                .attr('fill', '#94a3b8')
                .attr('font-size', '10px')
                .text(level);
        });

        // Create axes
        data.forEach((d, i) => {
            const angle = angleScale(i) - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            g.append('line')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', x)
                .attr('y2', y)
                .attr('stroke', 'rgba(148, 163, 184, 0.2)')
                .attr('stroke-width', 1);

            // Add labels
            const labelRadius = radius + 20;
            const labelX = Math.cos(angle) * labelRadius;
            const labelY = Math.sin(angle) * labelRadius;

            g.append('text')
                .attr('x', labelX)
                .attr('y', labelY)
                .attr('text-anchor', 'middle')
                .attr('fill', '#fff')
                .attr('font-size', '12px')
                .text(d.metric);
        });

        // Create area
        const lineGenerator = d3.lineRadial()
            .angle((d, i) => angleScale(i) - Math.PI / 2)
            .radius(d => radiusScale(d.value))
            .curve(d3.curveCardinalClosed);

        g.append('path')
            .datum(data)
            .attr('d', lineGenerator)
            .attr('fill', 'rgba(59, 130, 246, 0.3)')
            .attr('stroke', 'rgb(59, 130, 246)')
            .attr('stroke-width', 2);

        // Add points
        data.forEach((d, i) => {
            const angle = angleScale(i) - Math.PI / 2;
            const r = radiusScale(d.value);
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;

            g.append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', 5)
                .attr('fill', 'rgb(59, 130, 246)')
                .attr('stroke', '#fff')
                .attr('stroke-width', 2)
                .on('mouseover', function (event) {
                    d3.select(this).attr('r', 7);
                    showTooltip(event, d);
                })
                .on('mouseout', function () {
                    d3.select(this).attr('r', 5);
                    hideTooltip();
                });
        });

        // Add title
        this.svg.append('text')
            .attr('x', this.width / 2)
            .attr('y', 30)
            .attr('text-anchor', 'middle')
            .attr('fill', '#fff')
            .attr('font-size', '18px')
            .attr('font-weight', 'bold')
            .text('Code Quality Radar');

        function showTooltip(event, d) {
            const tooltip = d3.select('body').append('div')
                .attr('class', 'complexity-tooltip')
                .style('position', 'absolute')
                .style('background', 'rgba(15, 23, 42, 0.95)')
                .style('color', '#fff')
                .style('padding', '10px')
                .style('border-radius', '8px')
                .style('border', '1px solid rgba(59, 130, 246, 0.5)')
                .style('pointer-events', 'none')
                .style('z-index', '10000')
                .html(`<strong>${d.metric}</strong><br/>Score: ${d.value}/10`);

            tooltip
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        }

        function hideTooltip() {
            d3.selectAll('.complexity-tooltip').remove();
        }
    }

    // Visualize from analysis data
    visualizeFromAnalysis(analysisData) {
        if (!analysisData || !analysisData.metrics) return;

        const metrics = analysisData.metrics;
        const data = [
            { metric: 'Complexity', value: parseInt(metrics.complexity) || 5 },
            { metric: 'Readability', value: parseInt(metrics.readability) || 5 },
            { metric: 'Maintainability', value: parseInt(metrics.maintainability) || 5 },
            { metric: 'Testability', value: parseInt(metrics.testability) || 5 },
            { metric: 'Reusability', value: parseInt(metrics.reusability) || 5 },
            { metric: 'Reliability', value: parseInt(metrics.reliability) || 5 }
        ];

        // Create radial chart by default
        this.createRadialChart(data);
    }
}

// Export for use in other modules
window.ComplexityVisualizer = ComplexityVisualizer;
