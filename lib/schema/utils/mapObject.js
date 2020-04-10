
module.exports = (object, iterator) => {
  const newObject = {};
  Object.keys(object).forEach((key, index) => {
    newObject[key] = iterator(key, object[key], index);
  });
  return newObject;
};
