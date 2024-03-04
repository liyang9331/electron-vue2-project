const state = {
  device: "desktop",
  key: "",
  name: "", //单位名称
  securityLevel: "", //数据密集权限
  isAdmin:false,//默认普通用户权限
};

const mutations = {
  setKey(state, data) {
    if(data.role){
      state.isAdmin = true
    }
    state.name = data.deptName;
    state.securityLevel = data.dataLevel;
    localStorage.setItem('LEVEL_DATA', data.dataLevel)
    localStorage.setItem('NOMAL_USER', data.role ? 'admin' : 'nomal')
    localStorage.setItem("key", JSON.stringify(data));
  },
  removeKey(state){
    state.key=""
    state.name=""
    state.securityLevel=""
    state.isAdmin = false
    localStorage.removeItem("key")
    localStorage.removeItem("LEVEL_DATA")
    localStorage.removeItem("NOMAL_USER")
  }
};

const actions = {
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
