import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GraphData, WordNode } from '../types';

interface GraphProps {
  data: GraphData;
  width: number;
  height: number;
  onNodeClick?: (node: WordNode) => void;
  keywordSize: number;
  associationOpacity: number;
}

export const Graph: React.FC<GraphProps> = ({
  data,
  width,
  height,
  onNodeClick,
  keywordSize,
  associationOpacity
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    
    // Create a group for zoom transformation
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Center zoom
    svg.call(zoom.transform as any, d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(1));

    // Define node radius for collision detection
    const nodeRadius = 8;
    
    const simulation = d3.forceSimulation(data.nodes as any)
      .force('link', d3.forceLink(data.links)
        .id((d: any) => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody()
        .strength(-100))
      .force('center', d3.forceCenter(0, 0))
      .force('gravity', d3.forceManyBody().strength(30))
      .force('collision', d3.forceCollide().radius(30))
      .force('x', d3.forceX(0).strength(0.1))
      .force('y', d3.forceY(0).strength(0.1))
      .on('tick', () => {
        data.nodes.forEach((d: any) => {
          const bounds = {
            left: -width / 3,
            right: width / 3,
            top: -height / 3,
            bottom: height / 3
          };

          d.x = Math.max(bounds.left + nodeRadius, Math.min(bounds.right - nodeRadius, d.x));
          d.y = Math.max(bounds.top + nodeRadius, Math.min(bounds.bottom - nodeRadius, d.y));
        });

        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);

        node
          .attr('cx', (d: any) => d.x)
          .attr('cy', (d: any) => d.y);

        label
          .attr('x', (d: any) => d.x)
          .attr('y', (d: any) => d.y);

        relationship
          .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
          .attr('y', (d: any) => (d.source.y + d.target.y) / 2);
      });

    const link = g.append('g')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', '#4B5563')
      .attr('stroke-opacity', (d) => d.relationship === 'association' ? associationOpacity : 0.6)
      .attr('stroke-width', (d) => Math.sqrt(d.value));

    const node = g.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .join('circle')
      .attr('r', nodeRadius)
      .attr('fill', (d) => d3.schemeSet3[d.group % 12])
      .style('cursor', 'pointer')
      .on('click', (event, d) => onNodeClick?.(d));

    const label = g.append('g')
      .selectAll('text')
      .data(data.nodes)
      .join('text')
      .text((d) => d.id)
      .attr('font-size', `${keywordSize}px`)
      .attr('fill', '#E5E7EB')
      .attr('dx', 12)
      .attr('dy', 4);

    const relationship = g.append('g')
      .selectAll('text')
      .data(data.links)
      .join('text')
      .text((d) => {
        if (d.relationship === 'association') return '';
        return d.sharedKeywords?.join(', ') || '';
      })
      .attr('font-size', '10px')
      .attr('fill', '#9CA3AF')
      .attr('opacity', (d) => d.relationship === 'association' ? associationOpacity : 0.6)
      .attr('text-anchor', 'middle');

    node.call(d3.drag<any, any>()
      .on('start', (event) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      })
      .on('drag', (event) => {
        const bounds = {
          left: -width / 3,
          right: width / 3,
          top: -height / 3,
          bottom: height / 3
        };

        event.subject.fx = Math.max(
          bounds.left + nodeRadius,
          Math.min(bounds.right - nodeRadius, event.x)
        );
        event.subject.fy = Math.max(
          bounds.top + nodeRadius,
          Math.min(bounds.bottom - nodeRadius, event.y)
        );
      })
      .on('end', (event) => {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }));

    return () => {
      simulation.stop();
    };
  }, [data, width, height, onNodeClick, keywordSize, associationOpacity]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="bg-gray-800 rounded-lg"
    />
  );
};