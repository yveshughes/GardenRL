'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Real data from W&B run p8rggsh0 (127-step) and xd72dxcd (50-step Qwen baseline)
const llamaData = [
  { step: 0, reward: 0.140 },
  { step: 20, reward: 0.138 },
  { step: 40, reward: 0.137 },
  { step: 60, reward: 0.141 },
  { step: 80, reward: 0.139 },
  { step: 100, reward: 0.138 },
  { step: 113, reward: 0.786 },
  { step: 118, reward: 0.819 },
  { step: 122, reward: 0.878 },
  { step: 127, reward: 0.839 },
];

const qwenData = [
  { step: 0, reward: 0.389 },
  { step: 10, reward: 0.288 },
  { step: 20, reward: 0.467 },
  { step: 30, reward: 0.313 },
  { step: 40, reward: 0.251 },
  { step: 50, reward: 0.320 },
];

export default function RewardProgressionChart() {
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

      const xScale = d3.scaleLinear().domain([0, 130]).range([0, innerWidth]);
      const yScale = d3.scaleLinear().domain([0, 1.0]).range([height, 0]);

      // Grid lines
      svg.append('g')
        .attr('opacity', 0.1)
        .call(d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => ''));

      // Llama line
      const llamaLine = d3.line<{ step: number; reward: number }>()
        .x(d => xScale(d.step))
        .y(d => yScale(d.reward))
        .curve(d3.curveMonotoneX);

      svg.append('path')
        .datum(llamaData)
        .attr('fill', 'none')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 2.5)
        .attr('d', llamaLine);

      svg.selectAll('.llama-dot')
        .data(llamaData)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.step))
        .attr('cy', d => yScale(d.reward))
        .attr('r', 4)
        .attr('fill', '#10b981')
        .attr('stroke', '#064e3b')
        .attr('stroke-width', 1.5);

      // Qwen line
      const qwenLine = d3.line<{ step: number; reward: number }>()
        .x(d => xScale(d.step))
        .y(d => yScale(d.reward))
        .curve(d3.curveMonotoneX);

      svg.append('path')
        .datum(qwenData)
        .attr('fill', 'none')
        .attr('stroke', '#64748b')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '6,4')
        .attr('d', qwenLine);

      svg.selectAll('.qwen-dot')
        .data(qwenData)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.step))
        .attr('cy', d => yScale(d.reward))
        .attr('r', 3)
        .attr('fill', '#64748b')
        .attr('stroke', '#334155')
        .attr('stroke-width', 1);

      // Axes
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickValues([0, 20, 40, 60, 80, 100, 127]).tickFormat(d => `${d}`))
        .selectAll('text')
        .attr('fill', '#9ca3af');

      svg.append('g')
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => d3.format('.1f')(d as number)))
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
        .text('Reward');

      // Inline legend at top
      const legend = svg.append('g')
        .attr('transform', `translate(${innerWidth - 140}, 0)`);

      legend.append('line')
        .attr('x1', 0).attr('y1', 0).attr('x2', 16).attr('y2', 0)
        .attr('stroke', '#10b981').attr('stroke-width', 2.5);
      legend.append('text')
        .attr('x', 20).attr('y', 4)
        .attr('fill', '#d1d5db').attr('font-size', '11px')
        .text('Llama 8B (4 att.)');

      legend.append('line')
        .attr('x1', 0).attr('y1', 18).attr('x2', 16).attr('y2', 18)
        .attr('stroke', '#64748b').attr('stroke-width', 2).attr('stroke-dasharray', '6,4');
      legend.append('text')
        .attr('x', 20).attr('y', 22)
        .attr('fill', '#9ca3af').attr('font-size', '11px')
        .text('Qwen 14B (1 att.)');
    };

    drawChart();
    const observer = new ResizeObserver(drawChart);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-slate-900/50 rounded-lg p-6" ref={containerRef}>
      <h3 className="text-lg font-bold text-white mb-1">Reward Curve</h3>
      <p className="text-sm text-gray-400 mb-4">
        Reward jumps 6x once full 30-day episodes begin at step 113
      </p>
      <div className="overflow-x-auto">
        <svg ref={svgRef} className="mx-auto" />
      </div>
    </div>
  );
}
