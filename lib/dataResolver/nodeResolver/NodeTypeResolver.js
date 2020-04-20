const containsAll = require('array-contains-all');
const { flatten } = require('array-flatten');
const arrayUnique = require('array-unique');
const combinations = require('./combinations');
const NodeNotFoundError = require('./NodeNotFoundError');

module.exports = class NodeTypeResolver {
  constructor(typeName, resolvers) {
    this.typeName = typeName;
    this.resolverSets = combinations(resolvers)
      .map((resolversSet) => ({
        totalWeight: resolversSet.reduce((sum, resolver) => (
          sum + (resolver.weight || resolver.fields.length)
        ), 0),
        allFields: arrayUnique(flatten(resolversSet.map((resolver) => resolver.fields))),
        resolvers: resolversSet,
      }))
      .sort((a, b) => a.totalWeight - b.totalWeight);
  }

  selectResolvers(wantedFields) {
    const bestOption = this.resolverSets
      .find((option) => containsAll(option.allFields, wantedFields));

    if (!bestOption) {
      throw new Error(`Cannot resolve some fields on type "${this.typeName}"`);
    }

    return bestOption.resolvers;
  }

  resolve(context, id, fieldNames) {
    const fieldsResults = { id };
    const filteredFieldNames = fieldNames.filter((fieldName) => fieldName !== 'id');
    if (filteredFieldNames.length > 0) {
      const selectedResolvers = this.selectResolvers(filteredFieldNames);
      selectedResolvers.forEach(({ fields, resolve }) => {
        const promise = Promise.resolve().then(() => resolve(context, id));
        fields.forEach((fieldName) => {
          if (!fieldsResults[fieldName]) {
            fieldsResults[fieldName] = promise
              .then((result) => {
                if (!result) {
                  throw new NodeNotFoundError(this.typeName, id);
                }
                return result[fieldName];
              });
          }
        });
      });
    }

    return fieldsResults;
  }
};
