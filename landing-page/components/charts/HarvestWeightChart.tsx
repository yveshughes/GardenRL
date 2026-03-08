'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Real data from W&B run p8rggsh0 (127-step GRPO training, Llama 3.1 8B)
// Baseline: Step 0 evaluation across 20 seeds on full 30-day episodes = 99.0g avg
// Trained: 30-day curriculum phase (steps 113+) where harvest actually occurs
const data = [
  { label: 'Baseline', harvest: 99.0, trained: false },
  { label: 'Step 113', harvest: 185.6, trained: true },
  { label: 'Step 115', harvest: 191.0, trained: true },
  { label: 'Step 118', harvest: 194.4, trained: true },
  { label: 'Step 120', harvest: 191.2, trained: true },
  { label: 'Step 122', harvest: 213.7, trained: true },
  { label: 'Step 125', harvest: 203.3, trained: true },
  { label: 'Step 127', harvest: 200.9, trained: true },
];

const BASELINE = 99.0;
const SUCCESS_THRESHOLD = 150;

export default function HarvestWeightChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const drawChart = () => {
      if (!svgRef.current || !containerRef.current) return;
      d3.select(svgRef.current).selectAll('*').remove();

      const containerWidth = containerRef.current.clientWidth;
      const width = Math.min(containerWidth - 32, 800);
      const margin = { top: 30, right: 30, bottom: 60, left: 65 };
      const innerWidth = width - margin.left - margin.right;
      const height = 320 - margin.top - margin.bottom;

      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Evenly-spaced x-axis so data isn't scrunched
      const xScale = d3.scalePoint<string>()
        .domain(data.map(d => d.label))
        .range([0, innerWidth])
        .padding(0.4);

      const yScale = d3.scaleLinear().domain([0, 250]).range([height, 0]);

      // Grid lines
      svg.append('g')
        .attr('opacity', 0.1)
        .call(d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => ''));

      // Gradient fill under the trained portion
      const defs = svg.append('defs');
      const gradient = defs.append('linearGradient')
        .attr('id', 'harvestGradient')
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '0%').attr('y2', '100%');
      gradient.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.3);
      gradient.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', 0.02);

      // Area fill for trained data
      const trainedData = data.filter(d => d.trained);
      const area = d3.area<typeof data[0]>()
        .x(d => xScale(d.label)!)
        .y0(height)
        .y1(d => yScale(d.harvest))
        .curve(d3.curveMonotoneX);

      svg.append('path')
        .datum(trainedData)
        .attr('fill', 'url(#harvestGradient)')
        .attr('d', area);

      // Baseline reference line (unoptimized)
      svg.append('line')
        .attr('x1', 0)
        .attr('y1', yScale(BASELINE))
        .attr('x2', innerWidth)
        .attr('y2', yScale(BASELINE))
        .attr('stroke', '#64748b')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '6,4')
        .attr('opacity', 0.8);

      svg.append('text')
        .attr('x', innerWidth - 4)
        .attr('y', yScale(BASELINE) + 16)
        .attr('text-anchor', 'end')
        .attr('fill', '#94a3b8')
        .attr('font-size', '11px')
        .text(`Unoptimized baseline: ${BASELINE}g`);

      // Success threshold line (150g)
      svg.append('line')
        .attr('x1', 0)
        .attr('y1', yScale(SUCCESS_THRESHOLD))
        .attr('x2', innerWidth)
        .attr('y2', yScale(SUCCESS_THRESHOLD))
        .attr('stroke', '#eab308')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '8,4')
        .attr('opacity', 0.6);

      svg.append('text')
        .attr('x', innerWidth - 4)
        .attr('y', yScale(SUCCESS_THRESHOLD) - 6)
        .attr('text-anchor', 'end')
        .attr('fill', '#eab308')
        .attr('font-size', '11px')
        .text('150g success threshold');

      // Connecting line for trained data
      const line = d3.line<typeof data[0]>()
        .x(d => xScale(d.label)!)
        .y(d => yScale(d.harvest))
        .curve(d3.curveMonotoneX);

      svg.append('path')
        .datum(trainedData)
        .attr('fill', 'none')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 3)
        .attr('d', line);

      // Dashed connector from baseline to first trained point
      svg.append('line')
        .attr('x1', xScale('Baseline')!)
        .attr('y1', yScale(BASELINE))
        .attr('x2', xScale('Step 113')!)
        .attr('y2', yScale(185.6))
        .attr('stroke', '#10b981')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.6);

      // Data points
      data.forEach(d => {
        svg.append('circle')
          .attr('cx', xScale(d.label)!)
          .attr('cy', yScale(d.harvest))
          .attr('r', d.trained ? 6 : 5)
          .attr('fill', d.trained ? '#10b981' : '#64748b')
          .attr('stroke', d.trained ? '#064e3b' : '#334155')
          .attr('stroke-width', 2);
      });

      // Value labels on key points
      // Baseline
      svg.append('text')
        .attr('x', xScale('Baseline')!)
        .attr('y', yScale(BASELINE) - 14)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8')
        .attr('font-size', '13px')
        .attr('font-weight', 'bold')
        .text('99g');

      // Peak (step 122)
      svg.append('text')
        .attr('x', xScale('Step 122')!)
        .attr('y', yScale(213.7) - 14)
        .attr('text-anchor', 'middle')
        .attr('fill', '#10b981')
        .attr('font-size', '13px')
        .attr('font-weight', 'bold')
        .text('214g');

      svg.append('text')
        .attr('x', xScale('Step 122')!)
        .attr('y', yScale(213.7) - 28)
        .attr('text-anchor', 'middle')
        .attr('fill', '#10b981')
        .attr('font-size', '10px')
        .text('peak');

      // Final (step 127)
      svg.append('text')
        .attr('x', xScale('Step 127')!)
        .attr('y', yScale(200.9) - 14)
        .attr('text-anchor', 'middle')
        .attr('fill', '#d1d5db')
        .attr('font-size', '13px')
        .attr('font-weight', 'bold')
        .text('201g');

      // "2x yield" annotation
      const midX = (xScale('Baseline')! + xScale('Step 113')!) / 2;
      const midY = yScale((BASELINE + 185.6) / 2);
      svg.append('text')
        .attr('x', midX)
        .attr('y', midY)
        .attr('text-anchor', 'middle')
        .attr('fill', '#10b981')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .attr('opacity', 0.8)
        .text('2× yield');

      // X axis
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .attr('fill', '#9ca3af')
        .attr('font-size', '11px');

      // Y axis
      svg.append('g')
        .call(d3.axisLeft(yScale).ticks(6).tickFormat(d => `${d}g`))
        .selectAll('text')
        .attr('fill', '#9ca3af');

      // Axis label
      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -50)
        .attr('text-anchor', 'middle')
        .attr('fill', '#9ca3af')
        .attr('font-size', '13px')
        .text('Harvest Weight (grams)');
    };

    drawChart();
    const observer = new ResizeObserver(drawChart);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-slate-900/50 border border-emerald-900/30 rounded-lg p-6" ref={containerRef}>
      <h3 className="text-xl font-bold text-white mb-1">Harvest Weight: Before vs After Training</h3>
      <p className="text-sm text-gray-400 mb-4">
        GRPO training doubled lettuce yield &mdash; from 99g baseline to 200g+ consistently above the 150g success threshold.
      </p>
      <div className="overflow-x-auto">
        <svg ref={svgRef} className="mx-auto" />
      </div>
    </div>
  );
}
