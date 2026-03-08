'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const steps = [0, 10, 20, 30, 40, 50];
const llamaSuccess = [50, 55, 45, 50, 25, 60];
const qwenSuccess = [30, 15, 40, 20, 15, 30];

export default function SuccessRateComparisonChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const drawChart = () => {
      if (!svgRef.current || !containerRef.current) return;
      d3.select(svgRef.current).selectAll('*').remove();

      const containerWidth = containerRef.current.clientWidth;
      const width = Math.min(containerWidth - 32, 500);
      const margin = { top: 20, right: 20, bottom: 60, left: 60 };
      const innerWidth = width - margin.left - margin.right;
      const height = 280 - margin.top - margin.bottom;

      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const xScale = d3.scaleBand()
        .domain(steps.map(String))
        .range([0, innerWidth])
        .padding(0.3);

      const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);

      const barWidth = xScale.bandwidth() / 2.2;

      // Grid lines
      svg.append('g')
        .attr('opacity', 0.1)
        .call(d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => ''));

      // Llama bars
      svg.selectAll('.llama-bar')
        .data(steps)
        .enter()
        .append('rect')
        .attr('x', (_, i) => (xScale(String(steps[i])) || 0) + xScale.bandwidth() / 2 - barWidth - 1)
        .attr('y', (_, i) => yScale(llamaSuccess[i]))
        .attr('width', barWidth)
        .attr('height', (_, i) => height - yScale(llamaSuccess[i]))
        .attr('fill', '#10b981')
        .attr('rx', 2);

      // Qwen bars
      svg.selectAll('.qwen-bar')
        .data(steps)
        .enter()
        .append('rect')
        .attr('x', (_, i) => (xScale(String(steps[i])) || 0) + xScale.bandwidth() / 2 + 1)
        .attr('y', (_, i) => yScale(qwenSuccess[i]))
        .attr('width', barWidth)
        .attr('height', (_, i) => height - yScale(qwenSuccess[i]))
        .attr('fill', '#64748b')
        .attr('rx', 2);

      // Llama labels
      svg.selectAll('.llama-label')
        .data(steps)
        .enter()
        .append('text')
        .attr('x', (_, i) => (xScale(String(steps[i])) || 0) + xScale.bandwidth() / 2 - barWidth / 2 - 1)
        .attr('y', (_, i) => yScale(llamaSuccess[i]) - 6)
        .attr('text-anchor', 'middle')
        .attr('fill', '#10b981')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text((_, i) => `${llamaSuccess[i]}%`);

      // Qwen labels
      svg.selectAll('.qwen-label')
        .data(steps)
        .enter()
        .append('text')
        .attr('x', (_, i) => (xScale(String(steps[i])) || 0) + xScale.bandwidth() / 2 + barWidth / 2 + 1)
        .attr('y', (_, i) => yScale(qwenSuccess[i]) - 6)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8')
        .attr('font-size', '10px')
        .text((_, i) => `${qwenSuccess[i]}%`);

      // Axes
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d => `Step ${d}`))
        .selectAll('text')
        .attr('fill', '#9ca3af');

      svg.append('g')
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}%`))
        .selectAll('text')
        .attr('fill', '#9ca3af');

      // Legend
      const legend = svg.append('g')
        .attr('transform', `translate(${innerWidth - 140}, -5)`);

      legend.append('rect').attr('width', 12).attr('height', 12).attr('fill', '#10b981').attr('rx', 2);
      legend.append('text').attr('x', 18).attr('y', 10).attr('fill', '#d1d5db').attr('font-size', '11px').text('Llama 3.1 8B');

      legend.append('rect').attr('x', 95).attr('width', 12).attr('height', 12).attr('fill', '#64748b').attr('rx', 2);
      legend.append('text').attr('x', 113).attr('y', 10).attr('fill', '#9ca3af').attr('font-size', '11px').text('Qwen3 14B');
    };

    drawChart();
    const observer = new ResizeObserver(drawChart);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-slate-900/50 rounded-lg p-6" ref={containerRef}>
      <h3 className="text-lg font-bold text-white mb-1">Success Rate Comparison</h3>
      <p className="text-sm text-gray-400 mb-4">
        Harvest success rate (150g+ threshold) by checkpoint
      </p>
      <div className="overflow-x-auto">
        <svg ref={svgRef} className="mx-auto" />
      </div>
    </div>
  );
}
