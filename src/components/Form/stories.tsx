import * as React from 'react';
// Import the storybook libraries
import { storiesOf } from '@storybook/react';
// import { action } from '@storybook/addon-actions';
// Import our component from this folder
// import { GraphqlForm } from './GraphqlForm';
import { TextInput, BooleanInput } from './widgets';

// Here we describe the stories we want to see of the Button. The component is
// pretty simple so we will just make two, one with text and one with emojis
// Simple call storiesOf and then chain .add() as many times as you wish
//
// .add() takes a name and then a function that should return what you want
// rendered in the rendering area
storiesOf('Boolean Widget', module)
  .add('Checked', () => (
    <BooleanInput value={true} />
  ))
  .add('Unchecked', () => (
    <BooleanInput value={false} />
  ));

storiesOf('Text Widget', module)
  .add('With Text', () => (
    <TextInput value="Test " />
  ))
  .add('Without Text', () => (
    <TextInput value="" />
  ));