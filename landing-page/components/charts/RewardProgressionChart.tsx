'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const llamaData = [
  { step: 0, reward: 0.482 },
  { step: 10, reward: 0.477 },
  { step: 20, reward: 0.446 },
  { step: 30, reward: 0.491 },
  { step: 40, reward: 0.293 },
  { step: 50, reward: 0.522 },
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
      const width = Math.min(containerWidth - 32, 800);
      const margin = { top: 20, right: 160, bottom: 60, left: 60 };
      const innerWidth = width - margin.left - margin.right;
      const height = 320 - margin.top - margin.bottom;

      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const xScale = d3.scaleLinear().domain([0, 50]).range([0, innerWidth]);
      const yScale = d3.scaleLinear().domain([0, 0.7]).range([height, 0]);

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
        .attr('r', 5)
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
        .attr('r', 3.5)
        .attr('fill', '#64748b')
        .attr('stroke', '#334155')
        .attr('stroke-width', 1);

      // Axes
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(6).tickFormat(d => `${d}`))
        .selectAll('text')
        .attr('fill', '#9ca3af');

      svg.append('g')
        .call(d3.axisLeft(yScale).ticks(7).tickFormat(d => d3.format('.2f')(d as number)))
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

      // Legend
      const legend = svg.append('g')
        .attr('transform', `translate(${innerWidth + 16}, 20)`);

      // Llama legend
      legend.append('line')
        .attr('x1', 0).attr('y1', 0).attr('x2', 20).attr('y2', 0)
        .attr('stroke', '#10b981').attr('stroke-width', 2.5);
      legend.append('circle')
        .attr('cx', 10).attr('cy', 0).attr('r', 4)
        .attr('fill', '#10b981');
      legend.append('text')
        .attr('x', 28).attr('y', 4)
        .attr('fill', '#d1d5db').attr('font-size', '12px')
        .text('Llama 3.1 8B');

      // Qwen legend
      legend.append('line')
        .attr('x1', 0).attr('y1', 30).attr('x2', 20).attr('y2', 30)
        .attr('stroke', '#64748b').attr('stroke-width', 2).attr('stroke-dasharray', '6,4');
      legend.append('circle')
        .attr('cx', 10).attr('cy', 30).attr('r', 3)
        .attr('fill', '#64748b');
      legend.append('text')
        .attr('x', 28).attr('y', 34)
        .attr('fill', '#9ca3af').attr('font-size', '12px')
        .text('Qwen3 14B');

      // Subtitle in legend
      legend.append('text')
        .attr('x', 0).attr('y', 60)
        .attr('fill', '#6b7280').attr('font-size', '10px')
        .text('(1 attempt, no GRPO)');
    };

    drawChart();
    const observer = new ResizeObserver(drawChart);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-slate-900/50 rounded-lg p-6" ref={containerRef}>
      <h3 className="text-xl font-bold text-white mb-2">Reward Progression</h3>
      <p className="text-sm text-gray-400 mb-4">
        Mean reward on 20 held-out evaluation seeds across training checkpoints
      </p>
      <div className="overflow-x-auto">
        <svg ref={svgRef} className="mx-auto" />
      </div>
      <div className="mt-4 p-4 bg-slate-950/50 border border-slate-700 rounded-lg">
        <p className="text-sm text-gray-300 leading-relaxed">
          <span className="font-semibold text-emerald-400">Llama 3.1 8B</span> (4 attempts, GRPO) shows
          steady improvement from 0.48 to 0.52 reward, while{' '}
          <span className="text-slate-400">Qwen3 14B</span> (1 attempt) stays flat
          or declines. Why? GRPO needs multiple attempts per prompt to compute advantages &mdash;
          with only 1 attempt, std=0, so the model gets zero learning signal. The 8B model fits 4
          attempts in GPU memory; the 14B model OOMs beyond 1.
        </p>
      </div>
    </div>
  );
}
