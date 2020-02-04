import * as React from 'react';
// Import the storybook libraries
import { storiesOf } from '@storybook/react';
import { GraphqlTable } from './GraphqlTable';
import ApolloClient from 'apollo-client';
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from '@apollo/react-hooks';

// Here we describe the stories we want to see of the Button. The component is
// pretty simple so we will just make two, one with text and one with emojis
// Simple call storiesOf and then chain .add() as many times as you wish
//
// .add() takes a name and then a function that should return what you want
// rendered in the rendering area
const httpLink = createHttpLink({ uri: 'http://localhost:5000/graphql' });
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
})

if (process.env.NODE_ENV === 'development') {
  storiesOf('Graphql Table', module)
    .add('User', () => (
      <ApolloProvider client={client}>
        <GraphqlTable<any> modelName="User" columns={[]} hiddenColumns={[]} />
      </ApolloProvider>
    ))
}

