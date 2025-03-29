export const TEST_DATA = {
  nodes: [
    {
      name: "spelling correction",
      id: 1,
    },
    {
      name: "structured prediction, structured learning",
      id: 2,
    },
    {
      name: "pointer networks",
      id: 3,
    },
    {
      name: "spectral methods",
      id: 4,
    },
    {
      name: "graph convolutional networks",
      id: 5,
    },
  ],
  links: [
    {
      source: 1,
      target: 2,
      score: 0.1,
    },
    {
      source: 1,
      target: 3,
      score: 0.7,
    },
    {
      source: 1,
      target: 4,
      score: 0.2,
    },
    {
      source: 1,
      target: 5,
      score: 0.5,
    },
    {
      source: 2,
      target: 3,
      score: 0.6,
    },
    {
      source: 2,
      target: 5,
      score: 1,
    },
    {
      source: 2,
      target: 4,
      score: 0.6,
    },
    {
      source: 4,
      target: 5,
      score: 0.6,
    },
  ],
};
