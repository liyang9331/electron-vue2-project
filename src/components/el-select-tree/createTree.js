/**
 * 将树形一维数组转换成父子节点嵌套结构
 * @param {*} arr
 */
export default function createTree(arr) {
  const map = new Map();
  let result = [];

  // 将一维数组转化为以id为键的Map
  arr.forEach((item) => {
    map.set(item.id, {
      label: item.name,
      value: item.name,
      children: [],
      ...item,
    });
  });
  console.log(arr)
  // 遍历数组，将子节点添加到父节点的children属性中
  map.forEach((item) => {
    const parent = map.get(item.parentid);
    let obj = item
    if (parent) {
      // console.log(parent)
      parent.children.push(obj);
      // result.push(parent)
    } else {
      result.push(obj); // 如果没有父节点，将其视为根节点
    }
    if(item.children.length==0){
      delete obj.children
    }
  });

  return result;
}
