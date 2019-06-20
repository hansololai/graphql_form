import * as React from 'react';
// Import the storybook libraries
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions'
import { GraphqlTable } from './GraphqlTable';
import gql from 'graphql-tag';
import ApolloClient from 'apollo-client';
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';

// Here we describe the stories we want to see of the Button. The component is
// pretty simple so we will just make two, one with text and one with emojis
// Simple call storiesOf and then chain .add() as many times as you wish
//
// .add() takes a name and then a function that should return what you want
// rendered in the rendering area
const httpLink = new HttpLink({ uri: 'http://localhost:5000/graphql' });
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
})

storiesOf('Graphql Table', module)
  .add('User', () => (
    <ApolloProvider client={client}>
      <GraphqlTable<any> modelName="User" columns={[]} hiddenColumns={[]} />
    </ApolloProvider>
  ))
