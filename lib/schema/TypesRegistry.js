const {
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLFloat,
  GraphQLNonNull,
  GraphQLList,
} = require('graphql');
const { GraphQLJSON } = require('graphql-type-json');

module.exports = class TypesRegistry {
  constructor() {
    this._types = new Map([
      ['ID', GraphQLID],
      ['String', GraphQLString],
      ['Boolean', GraphQLBoolean],
      ['Int', GraphQLInt],
      ['Float', GraphQLFloat],
      ['JSON', GraphQLJSON],
    ]);
  }

  getType(name) {
    if (typeof name !== 'string') {
      return name;
    }

    if (!name) {
      throw new Error('Invalid type name: (empty string)');
    }

    if (this._types.has(name)) {
      return this._types.get(name);
    }

    // non-null type
    if (name.endsWith('!')) {
      const baseType = this.getType(name.slice(0, -1));
      const type = new GraphQLNonNull(baseType);
      if (baseType.transform) {
        type.transform = baseType.transform;
      }

      this._types.set(name, type);
      return type;
    }

    // list type
    if (name.startsWith('[') && name.endsWith(']')) {
      const baseType = this.getType(name.slice(1, -1));
      const type = new GraphQLList(baseType);
      if (baseType.transform) {
        type.transform = (value) => value.map((item) => baseType.transform(item));
      }

      this._types.set(name, type);
      return type;
    }

    throw new Error(`Invalid type name: ${name}`);
  }

  getTypes(names) {
    return names.map((name) => this.getType(name));
  }

  registerType(name, definition) {
    this._types.set(name, definition);
  }
};
