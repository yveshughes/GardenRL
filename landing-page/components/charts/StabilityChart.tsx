'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Step {
  day: number;
  ph: number;
  ec: number;
}

interface Episode {
  episode: number;
  steps: Step[];
  strategy: string;
}

interface StabilityChartProps {
  episodes: Episode[];
}

export default function StabilityChart({ episodes }: StabilityChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !episodes || episodes.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Find early vs late episodes (both from optimal strategy for fair comparison)
    const optimalEpisodes = episodes.filter(e => e.strategy === 'optimal' && e.steps);
    const earlyEpisode = optimalEpisodes.find(e => e.episode <= 10);
    const lateEpisode = optimalEpisodes[optimalEpisodes.length - 1];

    if (!earlyEpisode || !lateEpisode) return;

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
      .domain([0, 30])
      .range([0, width]);

    const yScalePH = d3.scaleLinear()
      .domain([4, 9])
      .range([height, 0]);

    const yScaleEC = d3.scaleLinear()
      .domain([0, 3])
      .range([height, 0]);

    // Optimal range bands
    const optimalPH = { min: 5.5, max: 6.5 };
    const optimalEC = { min: 1.2, max: 2.0 };

    // Add pH optimal range band
    svg.append('rect')
      .attr('x', 0)
      .attr('y', yScalePH(optimalPH.max))
      .attr('width', width)
      .attr('height', yScalePH(optimalPH.min) - yScalePH(optimalPH.max))
      .attr('fill', '#10b981')
      .attr('opacity', 0.1);

    // Grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(d3.axisLeft(yScalePH)
        .tickSize(-width)
        .tickFormat(() => '')
      );

    // Line generators
    const phLine = d3.line<Step>()
      .x(d => xScale(d.day))
      .y(d => yScalePH(d.ph))
      .curve(d3.curveMonotoneX);

    const ecLine = d3.line<Step>()
      .x(d => xScale(d.day))
      .y(d => yScaleEC(d.ec))
      .curve(d3.curveMonotoneX);

    // Draw early episode pH (dashed red)
    svg.append('path')
      .datum(earlyEpisode.steps)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.6)
      .attr('d', phLine);

    // Draw late episode pH (solid emerald)
    svg.append('path')
      .datum(lateEpisode.steps)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2)
      .attr('d', phLine);

    // Draw early episode EC (dashed orange)
    svg.append('path')
      .datum(earlyEpisode.steps)
      .attr('fill', 'none')
      .attr('stroke', '#f97316')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.6)
      .attr('d', ecLine);

    // Draw late episode EC (solid cyan)
    svg.append('path')
      .datum(lateEpisode.steps)
      .attr('fill', 'none')
      .attr('stroke', '#06b6d4')
      .attr('stroke-width', 2)
      .attr('d', ecLine);

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(10)
      .tickFormat(d => `Day ${d}`);

    const yAxisPH = d3.axisLeft(yScalePH)
      .ticks(8);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#9ca3af');

    svg.append('g')
      .call(yAxisPH)
      .selectAll('text')
      .attr('fill', '#9ca3af');

    // Axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9ca3af')
      .attr('font-size', '14px')
      .text('Day of Growth');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9ca3af')
      .attr('font-size', '14px')
      .text('pH / EC');

    // Optimal range labels
    svg.append('text')
      .attr('x', width - 5)
      .attr('y', yScalePH(6.0))
      .attr('text-anchor', 'end')
      .attr('fill', '#10b981')
      .attr('font-size', '11px')
      .attr('opacity', 0.6)
      .text('Optimal pH');

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width + 10}, 20)`);

    const legendItems = [
      { label: `Early pH (Ep ${earlyEpisode.episode})`, color: '#ef4444', dashed: true },
      { label: `Late pH (Ep ${lateEpisode.episode})`, color: '#10b981', dashed: false },
      { label: `Early EC (Ep ${earlyEpisode.episode})`, color: '#f97316', dashed: true },
      { label: `Late EC (Ep ${lateEpisode.episode})`, color: '#06b6d4', dashed: false }
    ];

    legendItems.forEach((item, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 25})`);

      legendRow.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 15)
        .attr('y2', 0)
        .attr('stroke', item.color)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', item.dashed ? '5,5' : '0')
        .attr('opacity', item.dashed ? 0.6 : 1);

      legendRow.append('text')
        .attr('x', 20)
        .attr('y', 4)
        .attr('fill', '#9ca3af')
        .attr('font-size', '12px')
        .text(item.label);
    });

  }, [episodes]);

  return (
    <div className="bg-slate-900/50 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-2">pH & EC Stability</h3>
      <p className="text-sm text-gray-400 mb-4">
        Comparison of early vs late episodes showing improved parameter management
      </p>
      <div className="overflow-x-auto">
        <svg ref={svgRef} className="mx-auto" />
      </div>
      <div className="mt-4 p-4 bg-slate-950/50 border border-slate-700 rounded-lg">
        <p className="text-sm text-gray-300 leading-relaxed">
          <span className="font-semibold text-emerald-400">What this shows:</span> pH and EC (nutrient concentration) throughout a 30-day grow cycle.
          <span className="text-red-400/80"> Dashed lines</span> are from early training when the AI didn't know what to do — wild swings outside the optimal range (green band).
          <span className="text-emerald-400"> Solid lines</span> are from later episodes after learning — smooth, stable, staying in the safe zone.
          Bad pH locks out nutrients even if they're in the water. The AI learned to keep everything balanced.
        </p>
      </div>
    </div>
  );
}
