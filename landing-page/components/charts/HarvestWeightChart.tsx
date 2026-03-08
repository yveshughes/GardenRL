'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const llamaData = [
  { step: 0, mean: 99.0, std: 93.2 },
  { step: 10, mean: 97.0, std: 90.6 },
  { step: 20, mean: 88.4, std: 92.2 },
  { step: 30, mean: 100.2, std: 85.6 },
  { step: 40, mean: 44.8, std: 79.8 },
  { step: 50, mean: 109.9, std: 93.2 },
];

export default function HarvestWeightChart() {
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

      const xScale = d3.scaleLinear().domain([0, 50]).range([0, innerWidth]);
      const yScale = d3.scaleLinear().domain([0, 250]).range([height, 0]);

      // Grid lines
      svg.append('g')
        .attr('opacity', 0.1)
        .call(d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => ''));

      // Std deviation area
      const area = d3.area<{ step: number; mean: number; std: number }>()
        .x(d => xScale(d.step))
        .y0(d => yScale(Math.max(0, d.mean - d.std)))
        .y1(d => yScale(Math.min(250, d.mean + d.std)))
        .curve(d3.curveMonotoneX);

      svg.append('path')
        .datum(llamaData)
        .attr('fill', '#10b981')
        .attr('opacity', 0.12)
        .attr('d', area);

      // Success threshold line (150g)
      svg.append('line')
        .attr('x1', 0)
        .attr('y1', yScale(150))
        .attr('x2', innerWidth)
        .attr('y2', yScale(150))
        .attr('stroke', '#eab308')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '8,4')
        .attr('opacity', 0.7);

      svg.append('text')
        .attr('x', innerWidth - 4)
        .attr('y', yScale(150) - 6)
        .attr('text-anchor', 'end')
        .attr('fill', '#eab308')
        .attr('font-size', '11px')
        .text('150g success threshold');

      // Mean line
      const line = d3.line<{ step: number; mean: number }>()
        .x(d => xScale(d.step))
        .y(d => yScale(d.mean))
        .curve(d3.curveMonotoneX);

      svg.append('path')
        .datum(llamaData)
        .attr('fill', 'none')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 2.5)
        .attr('d', line);

      svg.selectAll('.dot')
        .data(llamaData)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.step))
        .attr('cy', d => yScale(d.mean))
        .attr('r', 5)
        .attr('fill', '#10b981')
        .attr('stroke', '#064e3b')
        .attr('stroke-width', 1.5);

      // Labels at each point
      svg.selectAll('.label')
        .data(llamaData)
        .enter()
        .append('text')
        .attr('x', d => xScale(d.step))
        .attr('y', d => yScale(d.mean) - 12)
        .attr('text-anchor', 'middle')
        .attr('fill', '#d1d5db')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text(d => `${d.mean.toFixed(0)}g`);

      // Axes
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(6).tickFormat(d => `${d}`))
        .selectAll('text')
        .attr('fill', '#9ca3af');

      svg.append('g')
        .call(d3.axisLeft(yScale).ticks(6).tickFormat(d => `${d}g`))
        .selectAll('text')
        .attr('fill', '#9ca3af');

      // Axis labels
      svg.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', height + 45)
        .attr('text-anchor', 'middle')
        .attr('fill', '#9ca3af')
        .attr('font-size', '13px')
        .text('Training Step');

      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -45)
        .attr('text-anchor', 'middle')
        .attr('fill', '#9ca3af')
        .attr('font-size', '13px')
        .text('Harvest Weight');
    };

    drawChart();
    const observer = new ResizeObserver(drawChart);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-slate-900/50 rounded-lg p-6" ref={containerRef}>
      <h3 className="text-lg font-bold text-white mb-1">Harvest Weight (Llama 3.1 8B)</h3>
      <p className="text-sm text-gray-400 mb-4">
        Mean harvest with standard deviation band
      </p>
      <div className="overflow-x-auto">
        <svg ref={svgRef} className="mx-auto" />
      </div>
    </div>
  );
}
