export const listToDocsObj = (list: any[], key: string = "_docID") => {
  return list.reduce((acc, item) => {
    acc[item[key]] = item;
    return acc;
  }, {});
};
