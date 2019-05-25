# GraphqlForm

## Motivation

This project was set out to create form for submitting data with a graphql server. The setup was specifically dealing the GraphQL Input Object in mutations, like in the following form: (Result of a __type query):
```
inputFields:[
	{
		name:"firstName",
		type:{
			name:"String",
			kind:"SCALAR"
		}
	},
	{
		name:"lastName",
		type:{
			name:"String",
			kind:"SCALAR"
		}
	}
]
```
As a tradition, for update mutation usually the input type name is modelName + Patch, like "UserPatch", to create a new instance of a model, the type name is "UserInput". So with input "User", it will fetch the input types of "UserPatch"/"UserInput" and based on the inputFields and generate a form for each field. 

## Features
### Integrate with Antd component library
The form uses antd component library to create all the form items. Antd uses rc-form as the core handler for form data. Which handles field validation, field error display. 

Component mapping to SCALAR type
String => <Input/>
Boolean => <Checkbox/>
Int => <Number/>
Float => <Number/>
Date/Time => <DatePicker/>/<TimePicker/>

> Does not handle custom scalar type other than Date/Time, BigFloat, BigInt

### Designed to work best with PostGraphile
Following the PostGraphile definition of mutations, it uses ModelInput when form is to create a new model,  and uses ModelPatch when form is to update a model. For both BigFloat and BigInt, it currently still uses <Number/>, which still converts to a Number (instead of String). 


### Auto validate the fields before submit
If an onSubmit function is passed in, the onSumit function will be called with a "form" object, which has several important functions, such as getFieldsData, validateFields, getFieldsError etc. The function will not be called if the input is invalid. 

### Uses Apollo Client
It uses Apollo Client <Query> which is a very helpful client library for graphql data cache and normalization. 

### Uses Typescript
The components are developed with typescript

### Uses Storybook for Demo

![Demo](demo.png)

## Get Started

Not ready for publish to NPM yet, working on doc and refactoring.

Simply import the GraphqlForm object and pass in modelName and onSumit to generate a form. 


## MIT License