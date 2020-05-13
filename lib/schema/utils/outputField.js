const {
  connectionArgs,
  connectionFromPromisedArray,
  offsetToCursor,
  cursorForObjectInConnection,
  toGlobalId,
} = require('graphql-relay');
const promiseProps = require('promise-props');
const prepareArgs = require('./prepareArgs');
const parseArgs = require('./parseArgs');
const connectionFromPromisedEdges = require('./connectionFromPromisedEdges');

function ensureAsyncResolve(resolve) {
  return async (object, args, context, info) => resolve(object, args, context, info);
}

const defaultResolveField = (object, fieldName) => object[fieldName];

module.exports = function outputField(
  typesRegistry,
  typeName,
  fieldName,
  fieldConfig,
  resolveField = defaultResolveField,
) {
  const {
    args,
    resolve,
    fromField,
    fromFields,
  } = fieldConfig;
  const connectionConfig = fieldConfig.connection || /Connection!?$/.test(fieldConfig.type);
  const isEdge = /Edge!?$/.test(fieldConfig.type);
  const field = {
    description: fieldConfig.description,
    type: typesRegistry.getType(fieldConfig.type),
    idType: fieldConfig.idType,
    args: args ? (
      prepareArgs(typesRegistry, args)
    ) : (
      connectionConfig && connectionArgs || null
    ),
    resolve: resolve ? ensureAsyncResolve(resolve) : async (object, fieldArgs, context, info) => {
      if (fromFields) {
        const fieldsData = {};
        fromFields.forEach((fieldName_) => {
          fieldsData[fieldName_] = resolveField(object, fieldName_, fieldArgs, context, info);
        });
        return promiseProps(fieldsData);
      }
      return resolveField(object, fromField || fieldName, fieldArgs, context, info);
    },
  };

  // process transform
  if (fieldConfig.transform) {
    const previousResolve = field.resolve;
    field.resolve = async (object, fieldArgs, context, info) => {
      const value = await previousResolve(object, fieldArgs, context, info);
      return fieldConfig.transform(value, fieldArgs, context);
    };
  }

  // edge resolution
  if (isEdge) {
    const previousResolve = field.resolve;
    field.resolve = async (object, fieldArgs, context, info) => {
      const value = await previousResolve(object, fieldArgs, context, info);
      if (!value || !value.cursor || !value.node) {
        throw new Error('Invalid data resolved for an edge');
      }
      const { cursor } = value;
      if (cursor.fromOffset) {
        return {
          ...value,
          cursor: cursor.fromOffset < 0 ? null : offsetToCursor(cursor.fromOffset),
        };
      }
      if (cursor.fromArray) {
        return {
          ...value,
          cursor: cursorForObjectInConnection(cursor.fromArray, value.node),
        };
      }
      return value;
    };
  }

  // connection resolution
  if (connectionConfig) {
    const previousResolve = field.resolve;
    if (connectionConfig === 'edge') {
      field.resolve = (object, fieldArgs, context, info) => connectionFromPromisedEdges(
        previousResolve(object, fieldArgs, context, info),
        fieldArgs,
      );
    } else {
      field.resolve = (object, fieldArgs, context, info) => connectionFromPromisedArray(
        previousResolve(object, fieldArgs, context, info),
        fieldArgs,
      );
    }
  }

  // id field formatting to global ID
  if (fieldConfig.idType) {
    const previousResolve = field.resolve;
    const formatId = (id) => toGlobalId(fieldConfig.idType, id);
    field.resolve = async (object, fieldArgs, context, info) => {
      const value = await previousResolve(object, fieldArgs, context, info);
      if (value) {
        return Array.isArray(value) ? value.map(formatId) : formatId(value);
      }
      return value;
    };
  }

  // parse args
  if (args) {
    const previousResolve = field.resolve;
    field.resolve = (object, fieldArgs, context, info) => (
      previousResolve(
        object,
        parseArgs(field.args, fieldArgs, context),
        context,
        info,
      )
    );
  }

  return field;
};
