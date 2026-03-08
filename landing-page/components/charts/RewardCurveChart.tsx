'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Episode {
  episode: number;
  reward: number;
  harvest_weight: number;
  strategy: string;
}

interface RewardCurveChartProps {
  episodes: Episode[];
}

export default function RewardCurveChart({ episodes }: RewardCurveChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !episodes || episodes.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Dimensions
    const margin = { top: 20, right: 120, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(episodes, d => d.episode) || 500])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(episodes, d => d.reward) || 2500])
      .range([height, 0]);

    // Color scale for strategy
    const colorScale = d3.scaleOrdinal<string>()
      .domain(['random', 'optimal'])
      .range(['#ef4444', '#10b981']); // red for random, emerald for optimal

    // Grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat(() => '')
      );

    // Add episodes as circles (colored by strategy)
    svg.selectAll('circle')
      .data(episodes)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.episode))
      .attr('cy', d => yScale(d.reward))
      .attr('r', 3)
      .attr('fill', d => colorScale(d.strategy))
      .attr('opacity', 0.6)
      .attr('stroke', d => colorScale(d.strategy))
      .attr('stroke-width', 1);

    // Calculate rolling average (window of 10)
    const rollingAvg = episodes.map((_, i) => {
      const start = Math.max(0, i - 9);
      const window = episodes.slice(start, i + 1);
      const avg = d3.mean(window, d => d.reward) || 0;
      return { episode: episodes[i].episode, avg };
    });

    // Line generator for rolling average
    const line = d3.line<{ episode: number; avg: number }>()
      .x(d => xScale(d.episode))
      .y(d => yScale(d.avg))
      .curve(d3.curveMonotoneX);

    // Draw rolling average line
    svg.append('path')
      .datum(rollingAvg)
      .attr('fill', 'none')
      .attr('stroke', '#8b5cf6') // purple for trend line
      .attr('stroke-width', 2)
      .attr('d', line);

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(10)
      .tickFormat(d => d.toString());

    const yAxis = d3.axisLeft(yScale)
      .ticks(8)
      .tickFormat(d => `${d}`);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#9ca3af');

    svg.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#9ca3af');

    // Axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9ca3af')
      .attr('font-size', '14px')
      .text('Episode');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9ca3af')
      .attr('font-size', '14px')
      .text('Reward');

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width + 10}, 20)`);

    const legendItems = [
      { label: 'Random Policy', color: '#ef4444', symbol: 'circle' },
      { label: 'Optimal Policy', color: '#10b981', symbol: 'circle' },
      { label: '10-Episode Avg', color: '#8b5cf6', symbol: 'line' }
    ];

    legendItems.forEach((item, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 25})`);

      if (item.symbol === 'circle') {
        legendRow.append('circle')
          .attr('cx', 6)
          .attr('cy', 0)
          .attr('r', 4)
          .attr('fill', item.color)
          .attr('opacity', 0.6);
      } else {
        legendRow.append('line')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', 12)
          .attr('y2', 0)
          .attr('stroke', item.color)
          .attr('stroke-width', 2);
      }

      legendRow.append('text')
        .attr('x', 20)
        .attr('y', 4)
        .attr('fill', '#9ca3af')
        .attr('font-size', '12px')
        .text(item.label);
    });

    // Milestones
    const firstSuccess = episodes.find(e => e.harvest_weight >= 150);
    if (firstSuccess) {
      const x = xScale(firstSuccess.episode);
      const y = yScale(firstSuccess.reward);

      svg.append('line')
        .attr('x1', x)
        .attr('y1', y)
        .attr('x2', x)
        .attr('y2', height)
        .attr('stroke', '#10b981')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.3);

      svg.append('text')
        .attr('x', x)
        .attr('y', y - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', '#10b981')
        .attr('font-size', '11px')
        .text(`First 150g+ (Ep ${firstSuccess.episode})`);
    }

  }, [episodes]);

  return (
    <div className="bg-slate-900/50 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-2">Learning Progression</h3>
      <p className="text-sm text-gray-400 mb-4">
        Reward over 500 episodes showing comparison between random and optimal policies
      </p>
      <div className="overflow-x-auto">
        <svg ref={svgRef} className="mx-auto" />
      </div>
      <div className="mt-4 p-4 bg-slate-950/50 border border-slate-700 rounded-lg">
        <p className="text-sm text-gray-300 leading-relaxed">
          <span className="font-semibold text-emerald-400">What this shows:</span> Each dot is one 30-day growing cycle.
          <span className="text-red-400"> Red dots</span> are random actions (no strategy) — most plants died or had tiny harvests.
          <span className="text-emerald-400"> Green dots</span> are the optimal policy (good pH/EC management) — consistent 150-220g harvests.
          The <span className="text-purple-400">purple line</span> is a rolling average smoothing out the noise.
          This proves the AI can learn: random = failure, smart decisions = success.
        </p>
      </div>
    </div>
  );
}
