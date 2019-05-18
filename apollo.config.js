module.exports = {
  client: {
    name: 'Coyote',
    service: {
      name: 'Gemini',
      url: 'http://localhost:5000/graphql',
    },
    watch:true,
    includes:[
      "src/**/*.{ts,tsx}"
    ]
  },
};
