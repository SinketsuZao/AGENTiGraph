export const findIndexOfNodes = (nodes, selectedId) => {
  return nodes.findIndex((el) => el.id === selectedId);
};

export const addFrequencyToNode = (graph) => {
  const { nodes, links } = graph;
  // add 0 to those who are alone
  nodes.forEach((node) => {
    node.frequency = 0;
  });

  links.forEach(({ source, target }) => {
    nodes[findIndexOfNodes(nodes, source.id ? source.id : source)].frequency++;
    nodes[findIndexOfNodes(nodes, target.id ? target.id : target)].frequency++;
  });

  return { nodes, links };
};

const calculateNodeRadius = (frequency) => {
  return Math.min(18 + Math.floor(frequency / 20), 24);
};

export const addRadiusToNode = (graph) => {
  graph.nodes.forEach((node) => {
    node["radius"] = calculateNodeRadius(node.frequency);
  });

  return graph;
};

export const getOverallFrequencyList = (nodes) => {
  return [...new Set(nodes.map((node) => node.frequency))];
};

export const sortNodesByFrequency = (nodes) => {
  return nodes.sort((a, b) => (a.frequency < b.frequency ? 1 : -1));
};

export const isNodeInsideSliceArray = (slicedArray, node) => {
  return slicedArray.findIndex((el) => el.id === node.id) !== -1;
};

export const isSubset = (array1, array2) =>
  array1.every((element) => array2.includes(element));

export const generateMentionedDataset = (mentionedNodes, rawData) => {
  const { nodes, links } = rawData;

  let newNodes = [],
    newLinks = [];

  const allIds = mentionedNodes.map((node) => node.id);

  links.forEach((link) => {
    const sourceTargetIds = [link.source.id, link.target.id];
    const mentionedNodeIds = mentionedNodes.map((node) => node.id);
    if (isSubset(sourceTargetIds, mentionedNodeIds)) {
      newLinks.push(link);
    }
  });

  let uniqueIds = [...new Set(allIds)];
  uniqueIds.forEach((uniqueId) => {
    let uniqueNode = nodes.find((node) => node.id === uniqueId);
    newNodes.push(uniqueNode);
  });
  return {
    nodes: newNodes,
    links: newLinks,
  };
};

export const generateSelectedDataset = (selectedId, rawData) => {
  const { nodes, links } = rawData;

  let newNodes = [],
    newLinks = [],
    allIds = [];

  links.forEach((link) => {
    if (link.source.id === selectedId || link.target.id === selectedId) {
      newLinks.push(link);
      allIds.push(link.source.id, link.target.id);
    }
  });

  let uniqueIds = [...new Set(allIds)];
  uniqueIds.forEach((uniqueId) => {
    let uniqueNode = nodes.find((node) => node.id === uniqueId);
    newNodes.push(uniqueNode);
  });
  return {
    nodes: newNodes,
    links: newLinks,
  };
};
