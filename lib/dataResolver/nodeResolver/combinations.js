
function combinationsRecurs(list) {
  if (list.length === 0) {
    return [];
  } if (list.length === 1) {
    return [list];
  }
  const first = list[0];
  const rest = list.slice(1);
  const restCominations = combinationsRecurs(rest);
  return [
    [first],
  ]
    .concat(restCominations)
    .concat(restCominations.map((otherList) => [first].concat(otherList)));
}

module.exports = combinationsRecurs;
