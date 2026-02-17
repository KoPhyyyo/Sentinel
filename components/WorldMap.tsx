
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AttackIncident } from '../types';

interface WorldMapProps {
  attacks: AttackIncident[];
}

const WorldMap: React.FC<WorldMapProps> = ({ attacks }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    const projection = d3.geoMercator()
      .scale(width / 6.5)
      .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    // Draw Map
    d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson').then((data: any) => {
      svg.append('g')
        .selectAll('path')
        .data(data.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', '#0f172a')
        .attr('stroke', '#1e293b')
        .attr('stroke-width', 0.5);

      // Animation Layer
      const g = svg.append('g');

      // Process Attacks
      attacks.forEach(attack => {
        const [srcLon, srcLat] = attack.coords.src;
        const [dstLon, dstLat] = attack.coords.dst;

        const srcPos = projection([srcLon, srcLat]);
        const dstPos = projection([dstLon, dstLat]);

        if (!srcPos || !dstPos) return;

        // Origin Point
        g.append('circle')
          .attr('cx', srcPos[0])
          .attr('cy', srcPos[1])
          .attr('r', 2)
          .attr('fill', '#ef4444')
          .attr('opacity', 0.8);

        // Target Point
        g.append('circle')
          .attr('cx', dstPos[0])
          .attr('cy', dstPos[1])
          .attr('r', 3)
          .attr('fill', '#22c55e')
          .attr('class', 'pulse');

        // Attack Line
        const line = g.append('path')
          .attr('d', `M ${srcPos[0]} ${srcPos[1]} Q ${(srcPos[0] + dstPos[0]) / 2} ${(srcPos[1] + dstPos[1]) / 2 - 50} ${dstPos[0]} ${dstPos[1]}`)
          .attr('fill', 'none')
          .attr('stroke', attack.severity === 'CRITICAL' ? '#ef4444' : '#3b82f6')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '100%')
          .attr('stroke-dashoffset', '100%')
          .attr('opacity', 0.6);

        line.transition()
          .duration(1500)
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', '0%')
          .on('end', () => {
             // Ripple effect at destination
             g.append('circle')
               .attr('cx', dstPos[0])
               .attr('cy', dstPos[1])
               .attr('r', 2)
               .attr('fill', 'none')
               .attr('stroke', '#22c55e')
               .attr('stroke-width', 1)
               .transition()
               .duration(1000)
               .attr('r', 15)
               .attr('opacity', 0)
               .remove();

             line.transition()
               .duration(500)
               .attr('opacity', 0)
               .remove();
          });
      });
    });
  }, [attacks]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-slate-950/50 rounded-lg border border-slate-800">
      <div className="absolute top-4 left-4 z-10">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Live Threat Vectors
        </h2>
      </div>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default WorldMap;
