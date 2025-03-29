import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import {
  addFrequencyToNode,
  sortNodesByFrequency,
  isNodeInsideSliceArray,
  addRadiusToNode,
} from "./utils";

const Visualization = (props) => {
  const d3Container = useRef(null);

  const width = 900;

  const height = 700;

  const processDuplicates = (data) => {
    const map = new Map();

    for (const item of data) {
      const key = `${item.source.id}-${item.target.id}`;

      if (map.has(key)) {
        const existingItem = map.get(key);
        existingItem.relation += `, ${item.relation}`;
      } else {
        map.set(key, { ...item });
      }
    }

    return Array.from(map.values());
  };

  const renderNodes = (
    nodes,
    topNodes,
    mouseover,
    mouseout,
    startDrag,
    dragging,
    endDrag,
  ) => {
    d3.select("g.nodes")
      .selectAll("circle")
      .data(nodes, (data) => data.id)
      .exit()
      .remove();

    d3.select("g.nodes")
      .selectAll("circle")
      .data(nodes, (data) => data.id)
      .enter()
      .append("circle")
      .attr("r", (d) => {
        return isNodeInsideSliceArray(topNodes, d) ? d.radius : 12;
      })
      .style("opacity", 1)
      .attr("fill", (d) => {
        const threshold = 20;
        if (d.frequency >= threshold * 5) {
          return "#264094";
        } else if (d.frequency >= threshold * 4) {
          return "#525da9";
        } else if (d.frequency >= threshold * 3) {
          return "#777bbe";
        } else if (d.frequency >= threshold * 2) {
          return "#9a9bd4";
        } else if (d.frequency >= threshold * 1) {
          return "#bdbde9";
        } else {
          return "#e0dfff";
        }
      })
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
      .on("click", (d) => props.handleSelectTopic(d.id))
      .call(
        d3
          .drag()
          .on("start", startDrag)
          .on("drag", dragging)
          .on("end", endDrag),
      )
      .call(updateNode);
  };

  const renderLinks = (links, update) => {
    d3.select("g.links")
      .selectAll("line")
      .data(links, (link) => link.index)
      .exit()
      .remove();

    d3.select("g.links")
      .selectAll("line")
      .data(links, (link) => link.index)
      .enter()
      .append("line")
      .attr("stroke", "#E5EAEB")
      .attr("stroke-width", "1px")
      .attr("stroke-opacity", (d) => {
        return 1;
      })
      .attr("marker-end", "url(#arrowhead)")
      .call(update);
  };

  const renderNodeLabels = (display) => {
    d3.select("g.labelNodes").selectAll("rect").attr("display", display);

    d3.select("g.labelNodes").selectAll("text").attr("display", display);
  };

  const renderLinkLabels = (links) => {
    d3.select("g.linkLabels")
      .selectAll("text")
      .data(links, (link) => link.index)
      .exit()
      .remove();

    const texts = d3
      .select("g.linkLabels")
      .selectAll("text")
      .data(links, (link) => link.index)
      .enter()
      .append("text")
      .text((d, i) => d.relation)
      .style("fill", "#012027")
      .style("opacity", 1)
      .style("font-size", 12)
      .style("pointer-events", "none")
      .call(updateLinkLabel);

    d3.select("g.linkLabels")
      .selectAll("rect")
      .data(links, (link) => link.index)
      .exit()
      .remove();

    const rects = d3
      .select("g.linkLabels")
      .selectAll("rect")
      .data(links, (link) => link.index)
      .enter()
      .append("rect")
      .attr("fill", "transparent")
      .attr("stroke", "#bdbde9")
      .attr("stroke-width", 2)
      .attr("rx", 4)
      .attr("ry", 4)
      .call(updateLinkLabel);

    texts.each(function (d, i) {
      const bbox = this.getBBox();
      const padding = 6; // 文本周围的额外空间

      rects
        .filter((_, j) => i === j)
        .attr("x", bbox.x - padding / 2)
        .attr("y", bbox.y - padding / 2)
        .attr("width", bbox.width + padding)
        .attr("height", bbox.height + padding)
        .call(updateLinkLabel);
    });
  };

  const updateNode = (node) => {
    node.attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  };

  const updateLinkLabel = (label) => {
    label.attr("transform", function (d) {
      const diffX = d.target.x - d.source.x;
      const diffY = d.target.y - d.source.y;

      return (
        "translate(" +
        (d.source.x + 0.7 * diffX) +
        "," +
        (d.source.y + 0.7 * diffY) +
        ")"
      );
    });
  };

  /* The useEffect Hook is for running side effects outside of React,
       for instance inserting elements into the DOM using D3 */
  useEffect(
    () => {
      if (props.data && d3Container.current) {
        // D3 Logic
        // remove previous rendered svg
        let preExistGroup = ReactDOM.findDOMNode(
          d3Container.current,
        ).querySelector("g");
        preExistGroup && preExistGroup.remove();

        const svg = d3
          .select(d3Container.current)
          .attr("width", width)
          .attr("height", height);

        let graph = props.data;

        let label = {
          nodes: [],
          links: [],
        };

        graph = addRadiusToNode(addFrequencyToNode(graph));
        const sortedArray = sortNodesByFrequency(graph.nodes);
        const topThreeHundredNodes = sortedArray.slice(0, 100);
        const topTenNodes = sortedArray.slice(0, 50);

        topThreeHundredNodes.forEach(function (d, i) {
          label.nodes.push({ node: d });
          label.nodes.push({ node: d });
          label.links.push({
            source: i * 2,
            target: i * 2 + 1,
          });
        });

        const labelLayout = d3
          .forceSimulation(label.nodes)
          .force("charge", d3.forceManyBody().strength(-50))
          .force("link", d3.forceLink(label.links).distance(0).strength(2));

        const graphLayout = d3
          .forceSimulation(graph.nodes)
          .force("charge", d3.forceManyBody().strength(-3000))
          .force("center", d3.forceCenter(width / 2, height / 2))
          .force("x", d3.forceX(width / 2).strength(1))
          .force("y", d3.forceY(height / 2).strength(1))
          .force(
            "link",
            d3
              .forceLink(graph.links)
              .id(function (d) {
                return d.id;
              })
              .distance(100)
              .strength(1),
          )
          .on("tick", ticked);

        const adjlist = {};
        let topThreeHundredLinks = [];

        graph.links.forEach(function (d) {
          const source = d.source.id;
          const target = d.target.id;

          const sourceExist = topThreeHundredNodes.some(
            (node) => node.id === source,
          );
          const targetExist = topThreeHundredNodes.some(
            (node) => node.id === target,
          );

          if (sourceExist && targetExist) {
            topThreeHundredLinks.push(d);
            if (d.source.id < d.target.id) {
              adjlist[d.source.id + "-" + d.target.id] = true;
            } else {
              adjlist[d.target.id + "-" + d.source.id] = true;
            }
          }
        });

        topThreeHundredLinks = processDuplicates(topThreeHundredLinks);

        d3.select("svg").data(props.data);
        // union_annotation
        const container = svg.append("g").attr("class", "containerGroup");

        svg.call(
          d3
            .zoom()
            .scaleExtent([0.1, 5])
            .on("zoom", function () {
              container.attr("transform", d3.event.transform);
            }),
        );

        const easyRenderNodes = (nodes, topNodes) =>
          renderNodes(
            nodes,
            topNodes,
            focus,
            unfocus,
            dragstarted,
            dragged,
            dragended,
          );

        container
          .append("svg:defs")
          .selectAll("marker")
          .data(["end"]) // Different link/path types can be defined here
          .enter()
          .append("marker") // This section adds in the arrows
          .attr("id", "arrowhead")
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 0)
          .attr("refY", 0)
          .attr("markerWidth", 6)
          .attr("markerHeight", 6)
          .attr("orient", "auto")
          .attr("xoverflow", "visible")
          .append("svg:path")
          .attr("d", "M 0,-5 L 10 ,0 L 0,5")
          .attr("fill", "#E5EAEB")
          .style("stroke", "none");

        container
          .append("g")
          .attr("class", "links")
          .selectAll("line")
          .data(topThreeHundredLinks, (data) => data.index)
          .enter()
          .append("line")
          .attr("stroke", "#E5EAEB")
          .attr("stroke-width", "1px")
          .attr("stroke-opacity", (d) => {
            return 1;
          })
          .attr("marker-end", "url(#arrowhead)");

        const linkLabelGroup = container
          .append("g")
          .attr("class", "linkLabels");

        const initTexts = linkLabelGroup
          .selectAll("text")
          .data(
            props.selectedId
              ? props.selectedId > 0
                ? topThreeHundredLinks.slice(
                    0,
                    topThreeHundredLinks.length / 10,
                  )
                : topThreeHundredLinks.slice(
                    0,
                    Math.max(1, topThreeHundredLinks.length / 10),
                  )
              : [],
            (link) => link.index,
          )
          .enter()
          .append("text")
          .text((d) => d.relation)
          .style("fill", "#012027")
          .style("opacity", 1)
          .style("font-size", 12)
          .style("pointer-events", "none");

        const initRects = linkLabelGroup
          .selectAll("rect")
          .data(
            props.selectedId
              ? props.selectedId > 0
                ? topThreeHundredLinks.slice(
                    0,
                    topThreeHundredLinks.length / 10,
                  )
                : topThreeHundredLinks.slice(
                    0,
                    Math.max(1, topThreeHundredLinks.length / 10),
                  )
              : [],
            (link) => link.index,
          )
          .enter()
          .append("rect")
          .attr("fill", "transparent")
          .attr("stroke", "#bdbde9")
          .attr("stroke-width", 2)
          .attr("rx", 4)
          .attr("ry", 4);

        initTexts.each(function (d, i) {
          const bbox = this.getBBox();
          const padding = 4; // 文本周围的额外空间

          initRects
            .filter((_, j) => i === j)
            .attr("x", bbox.x - padding / 2)
            .attr("y", bbox.y - padding / 2)
            .attr("width", bbox.width + padding)
            .attr("height", bbox.height + padding);
        });

        container
          .append("g")
          .attr("class", "nodes")
          .selectAll("circle")
          .data(topThreeHundredNodes, (data) => data.id)
          .enter()
          .append("circle")
          .attr("r", (d) => {
            return isNodeInsideSliceArray(topTenNodes, d) ? d.radius : 12;
          })
          .style("opacity", 1)
          .attr("fill", (d) => {
            const threshold = 20;
            if (d.frequency >= threshold * 5) {
              return "#264094";
            } else if (d.frequency >= threshold * 4) {
              return "#525da9";
            } else if (d.frequency >= threshold * 3) {
              return "#777bbe";
            } else if (d.frequency >= threshold * 2) {
              return "#9a9bd4";
            } else if (d.frequency >= threshold * 1) {
              return "#bdbde9";
            } else {
              return "#e0dfff";
            }
          })
          .on("mouseover", focus)
          .on("mouseout", unfocus)
          .on("click", (d) => props.handleSelectTopic(d.id))
          .call(
            d3
              .drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended),
          );

        const labelGroup = container.append("g").attr("class", "labelNodes");

        const backgroundRects = labelGroup
          .selectAll("rect")
          .data(label.nodes, (data) => data.id)
          .enter()
          .append("rect")
          .attr("fill", "white")
          .attr("stroke", "#bdbde9")
          .attr("stroke-width", (d, i) => (i % 2 !== 0 ? 2 : 0))
          .attr("rx", (d, i) => (i % 2 !== 0 ? 4 : 0))
          .attr("ry", (d, i) => (i % 2 !== 0 ? 4 : 0));

        const textLabels = labelGroup
          .selectAll("text")
          .data(label.nodes, (data) => data.id)
          .enter()
          .append("text")
          .text((d, i) => {
            if (props.isOverview) {
              return i % 2 !== 0 &&
                isNodeInsideSliceArray(topThreeHundredNodes, d.node)
                ? d.node.name
                : "";
            } else {
              return i % 2 !== 0 ? d.node.name : "";
            }
          })
          .style("fill", "#012027")
          .style("opacity", 1)
          .style("font-size", 12)
          .style("pointer-events", "none");
        // to prevent mouseover/drag capture

        textLabels.each(function (d, i) {
          const bbox = this.getBBox();
          const padding = 4; // 文本周围的额外空间

          backgroundRects
            .filter((_, j) => i === j && j % 2 !== 0)
            .attr("x", bbox.x - padding / 2)
            .attr("y", bbox.y - padding / 2)
            .attr("width", bbox.width + padding)
            .attr("height", bbox.height + padding);
        });

        const neigh = (a, b) => {
          const start = a < b ? a : b;
          const end = a < b ? b : a;
          return a === b || adjlist[`${start}-${end}`];
        };

        function ticked() {
          d3.select("g.nodes").selectAll("circle").call(updateNode);
          d3.select("g.links").selectAll("line").call(updateLink);

          labelLayout.alphaTarget(0.2).restart();

          d3.select("g.labelNodes")
            .selectAll("text")
            .each(function (d, i) {
              if (i % 2 === 0) {
                d.x = d.node.x;
                d.y = d.node.y;
              } else {
                let b = this.getBBox();

                let diffX = d.x - d.node.x;
                let diffY = d.y - d.node.y;

                let dist = Math.sqrt(diffX * diffX + diffY * diffY);

                let shiftX = (b.width * (diffX - dist)) / (dist * 2);
                shiftX = Math.max(-b.width, Math.min(0, shiftX));
                let shiftY = 16;

                this.setAttribute(
                  "transform",
                  "translate(" + shiftX + "," + shiftY + ")",
                );
              }
            })
            .call(updateNode);

          d3.select("g.linkLabels").selectAll("text").call(updateLinkLabel);

          d3.select("g.linkLabels").selectAll("rect").call(updateLinkLabel);

          d3.select("g.labelNodes").selectAll("rect").call(updateNode);
        }

        function focus(d) {
          const id = d.id;

          const relatedNodes = [d];

          let relatedLinks = [];

          graph.links.forEach((link) => {
            if (link.source.id === id) {
              relatedNodes.push(link.target);
              relatedLinks.push(link);
              return;
            }
            if (link.target.id === id) {
              relatedNodes.push(link.source);
              relatedLinks.push(link);
              return;
            }
          });

          relatedLinks = processDuplicates(relatedLinks);

          easyRenderNodes(relatedNodes, topTenNodes);

          renderLinks(relatedLinks, updateLink);

          renderNodeLabels((d) =>
            neigh(id, d.node.id, adjlist) ? "block" : "none",
          );

          if (props.selectedId && props.selectedId !== id) {
            renderLinkLabels(relatedLinks);
          }
        }

        function unfocus() {
          const defaultDisplayLinks = props.selectedId
            ? props.selectedId > 0
              ? topThreeHundredLinks.slice(0, topThreeHundredLinks.length / 10)
              : topThreeHundredLinks.slice(
                  0,
                  Math.max(1, topThreeHundredLinks.length / 10),
                )
            : [];

          renderLinkLabels(defaultDisplayLinks);

          easyRenderNodes(topThreeHundredNodes, topTenNodes);

          renderLinks(topThreeHundredLinks, updateLink);

          renderNodeLabels("display");
        }

        function updateLink(link) {
          link
            .attr("x1", function (d) {
              const isSourceTopTen = isNodeInsideSliceArray(
                topTenNodes,
                d.source,
              );
              const r = isSourceTopTen ? d.source.radius : 12;
              return (
                d.source.x +
                ((d.target.x - d.source.x) /
                  Math.sqrt(
                    Math.pow(d.target.x - d.source.x, 2) +
                      Math.pow(d.target.y - d.source.y, 2),
                  )) *
                  r
              );
            })
            .attr("y1", function (d) {
              const isSourceTopTen = isNodeInsideSliceArray(
                topTenNodes,
                d.source,
              );
              const r = isSourceTopTen ? d.source.radius : 12;
              return (
                d.source.y +
                ((d.target.y - d.source.y) /
                  Math.sqrt(
                    Math.pow(d.target.x - d.source.x, 2) +
                      Math.pow(d.target.y - d.source.y, 2),
                  )) *
                  r
              );
            })
            .attr("x2", function (d) {
              const isTargetTopTen = isNodeInsideSliceArray(
                topTenNodes,
                d.target,
              );
              const r = isTargetTopTen ? d.source.radius - 3 : 12;
              return (
                d.target.x -
                ((d.target.x - d.source.x) /
                  Math.sqrt(
                    Math.pow(d.target.x - d.source.x, 2) +
                      Math.pow(d.target.y - d.source.y, 2),
                  )) *
                  r *
                  2
              );
            })
            .attr("y2", function (d) {
              const isTargetTopTen = isNodeInsideSliceArray(
                topTenNodes,
                d.target,
              );
              const r = isTargetTopTen ? d.source.radius - 3 : 12;
              return (
                d.target.y -
                ((d.target.y - d.source.y) /
                  Math.sqrt(
                    Math.pow(d.target.x - d.source.x, 2) +
                      Math.pow(d.target.y - d.source.y, 2),
                  )) *
                  r *
                  2
              );
            })
            .attr("marker-end", "url(#arrowhead)")
            .style("stroke-width", 2);
        }

        function dragstarted(d) {
          d3.event.sourceEvent.stopPropagation();
          if (!d3.event.active) graphLayout.alphaTarget(0.4).restart();
          d.fx = d.x;
          d.fy = d.y;
        }

        function dragged(d) {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        }

        function dragended(d) {
          if (!d3.event.active) graphLayout.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }
      }
    },

    /*
            useEffect has a dependency array (below). It's a list of dependency
            variables for this useEffect block. The block will run after mount
            and whenever any of these variables change. We still have to check
            if the variables are valid, but we do not have to compare old props
            to next props to decide whether to rerender.
        */
    [props.data, props.isOverview, d3Container.current, props.selectedId],
  );

  return <svg className="d3-component canvas" ref={d3Container} />;
};

export default Visualization;
