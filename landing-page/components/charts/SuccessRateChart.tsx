'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Episode {
  episode: number;
  harvest_weight: number;
  died: boolean;
  strategy: string;
}

interface SuccessRateChartProps {
  episodes: Episode[];
}

export default function SuccessRateChart({ episodes }: SuccessRateChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !episodes || episodes.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Calculate success rates in bins of 50 episodes
    const binSize = 50;
    const bins: Array<{
      range: string;
      died: number;
      poor: number;
      good: number;
      excellent: number;
    }> = [];

    for (let i = 0; i < episodes.length; i += binSize) {
      const bin = episodes.slice(i, i + binSize);
      const start = i + 1;
      const end = Math.min(i + binSize, episodes.length);

      const died = bin.filter(e => e.died).length;
      const poor = bin.filter(e => !e.died && e.harvest_weight < 150).length;
      const good = bin.filter(e => e.harvest_weight >= 150 && e.harvest_weight < 200).length;
      const excellent = bin.filter(e => e.harvest_weight >= 200).length;

      bins.push({
        range: `${start}-${end}`,
        died,
        poor,
        good,
        excellent
      });
    }

    // Dimensions
    const margin = { top: 20, right: 120, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
      .domain(bins.map(d => d.range))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    // Stack data
    const stack = d3.stack<any>()
      .keys(['died', 'poor', 'good', 'excellent'])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetExpand);

    const series = stack(bins.map(d => ({
      range: d.range,
      died: (d.died / binSize) * 100,
      poor: (d.poor / binSize) * 100,
      good: (d.good / binSize) * 100,
      excellent: (d.excellent / binSize) * 100
    })));

    // Color scale
    const colors = {
      died: '#ef4444',      // red
      poor: '#f97316',      // orange
      good: '#eab308',      // yellow
      excellent: '#10b981'  // emerald
    };

    // Draw stacked areas
    const area = d3.area<any>()
      .x((d: any) => (xScale(d.data.range) || 0) + xScale.bandwidth() / 2)
      .y0((d: any) => yScale(d[0]))
      .y1((d: any) => yScale(d[1]))
      .curve(d3.curveMonotoneX);

    svg.selectAll('.layer')
      .data(series)
      .enter()
      .append('path')
      .attr('class', 'layer')
      .attr('d', area)
      .attr('fill', (d: any) => colors[d.key as keyof typeof colors])
      .attr('opacity', 0.8);

    // Grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat(() => '')
      );

    // Axes
    const xAxis = d3.axisBottom(xScale);

    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${d}%`);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#9ca3af')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end')
      .attr('dx', '-8px')
      .attr('dy', '0px');

    svg.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#9ca3af');

    // Axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 50)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9ca3af')
      .attr('font-size', '14px')
      .text('Episode Range');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9ca3af')
      .attr('font-size', '14px')
      .text('Distribution (%)');

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width + 10}, 20)`);

    const legendItems = [
      { label: 'Died', color: '#ef4444' },
      { label: 'Poor (<150g)', color: '#f97316' },
      { label: 'Good (150-200g)', color: '#eab308' },
      { label: 'Excellent (200g+)', color: '#10b981' }
    ];

    legendItems.forEach((item, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 25})`);

      legendRow.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', item.color)
        .attr('opacity', 0.8);

      legendRow.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .attr('fill', '#9ca3af')
        .attr('font-size', '12px')
        .text(item.label);
    });

  }, [episodes]);

  return (
    <div className="bg-slate-900/50 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-2">Success Rate Progression</h3>
      <p className="text-sm text-gray-400 mb-4">
        Outcome distribution showing improvement from early failures to consistent excellent harvests
      </p>
      <div className="overflow-x-auto">
        <svg ref={svgRef} className="mx-auto" />
      </div>
      <div className="mt-4 p-4 bg-slate-950/50 border border-slate-700 rounded-lg">
        <p className="text-sm text-gray-300 leading-relaxed">
          <span className="font-semibold text-emerald-400">What this shows:</span> How outcomes changed as training progressed (grouped into 50-episode chunks).
          Early episodes (1-50): mostly <span className="text-red-400">died</span> or <span className="text-orange-400">poor yields</span>.
          Later episodes (450-500): mostly <span className="text-yellow-400">good</span> (150-200g) or <span className="text-emerald-400">excellent</span> (200g+).
          This is the learning curve in action — from killing plants to consistently growing healthy lettuce.
        </p>
      </div>
    </div>
  );
}
