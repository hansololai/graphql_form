import * as React from 'react';
import { notification, Spin } from 'antd';
import { Query } from '@apollo/react-components';
import { modelFieldsQuery } from '../Form/queries'
import { fieldTypeQuery } from '../Form/__generated__/fieldTypeQuery';
import { InnerTable, InnerTableProps } from './InnerTable';
import 'antd/lib/notification/style'
import 'antd/lib/spin/style'


export class GraphqlTable<T> extends React.Component<Omit<InnerTableProps<T>, "fields">>{
  constructor(props) {
    super(props);
  }
  render() {
    const { modelName } = this.props;
    return <Query<fieldTypeQuery> query={modelFieldsQuery} variables={{ name: modelName }}>
      {({ data, loading, error }) => {
        if (loading) return <Spin />;
        if (error) {
          notification.error({
            message: "Error while fetching schema",
            description: error.message
          });
        }
        const { __type = null } = data || {};
        if (!__type) return null;
        const { fields } = __type;
        if (!fields) return null;
        return <InnerTable {...this.props} fields={fields} />;
      }}
    </Query>;
  }
}


