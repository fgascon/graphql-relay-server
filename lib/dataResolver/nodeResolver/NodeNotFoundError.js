
module.exports = class NodeNotFoundError extends Error {
  constructor(typeName, id) {
    super(`Node of type ${typeName} with ID ${id} is not found`);
    this.typeName = typeName;
    this.id = id;
  }
};
