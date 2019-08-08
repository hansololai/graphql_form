import * as React from 'react';
import { MockedProvider } from 'react-apollo/test-utils';
import { render } from '@testing-library/react';
import { GraphqlForm } from '../GraphqlForm';
import { mockData } from '../__mock__/dataMock'


it('Basic Graphql Form', () => {
  const { container } = render(
    <MockedProvider mocks={mockData}>
      <div style={{ width: 400 }}>
        <GraphqlForm modelName="User" instanceData={{ id: 1, firstName: "test", email: "test@test.com" }} />
      </div>
    </MockedProvider>
  );
  expect(container).toMatchSnapshot();
})