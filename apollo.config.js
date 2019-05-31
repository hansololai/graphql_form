module.exports = {
  client: {
    name: 'Graphql',
    service: {
      name: 'Server',
      url: 'http://localhost:5000/graphql',
    },
    watch: true,
    includes: [
      "src/**/*.{ts,tsx}"
    ]
  },
};
