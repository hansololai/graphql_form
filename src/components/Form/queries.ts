import gql from 'graphql-tag';

export const updateInputQuery = gql`
  query patchTypeQuery($name: String!){
    __type(name: $name){
      inputFields{
        name
        defaultValue
        type{
          name
          kind
          ofType{
            name
            kind
          }
        }
      } 
    }
  } 
`;

export const modelFieldsQuery = gql`
  query fieldTypeQuery($name: String!){
    __type(name: $name){
      fields{
        name
        type{
          name
          kind
          ofType{
            name
            kind
            
          }
        }
      }
    }
  }
`;
