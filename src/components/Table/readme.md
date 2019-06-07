### PostGraphile Table 

This is a typescript implementation of a table for records in a table (model). 
For any model, using a "__type" query should be able to get all the scalar fields of this table, as well as all the associations, the associated object by fooByFooId, or associated connection by "foosByBarId". 


#### Assumptions
Requires Postgraphile with connection filter and orderby plugin. This automatically construct columns for every column in the table. For example, if a column "name" of the table is "String" type, the constructed column is sortable with NAME_ASC and NAME_DESC when clicking on the sort button, and is searchable with any typed text become a filter:{name:{inclusive:""}}. 

#### Features
Allow some parameters for extra control of the table. 

The auto constracted columns can be replaced by passing in an extended column array. Which will replace the auto constructed column (only replace the overlapped fields).

You can also pass in extra columns, but each of these columns will require a fragment field, which is a graphql fragment on the model. For example, if the table is for User model, then the extra columns should have a field:
```
fragment: gql`
  fragment extendColumn1 on User{
    id
    name
    [other fields]
  }
`
```
This will be merged with the generated query.
Note the extended columns will require a key field that should be unique and it is the user's responsibility to ensure it is unique. 
#### Steps
Here we can first use the graphql __type query and filter to display all the scalar values. They are columns with key = fieldName. 

