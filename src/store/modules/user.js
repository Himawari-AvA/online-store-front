/*
 * @Description: 用户登录状态模块
 * @Author: hai-27
 * @Date: 2020-02-19 17:42:11
 * @LastEditors: Himawari 867415074@qq.com
 * @LastEditTime: 2023-03-28 16:47:18
 */
export default {
  state: {
    user: '', // 登录的用户
    showLogin: false, // 用于控制是否显示登录组件
    showChangeInfo: false, // 用于控制是否显示修改信息组件
    oneInfo: {},
  },
  getters: {
    getUser(state) {
      return state.user;
    },
    getOne(state) {
      return state.oneInfo;
    },
    getShowLogin(state) {
      return state.showLogin;
    },
    getShowChangeInfo(state) {
      return state.showChangeInfo;
    },
  },
  mutations: {
    setUser(state, data) {
      state.user = data;
    },
    setOne(state, data) {
      state.oneInfo = data;
    },
    setShowLogin(state, data) {
      state.showLogin = data;
    },
    setShowChangeInfo(state, data) {
      state.showChangeInfo = data;
    },
  },
  actions: {
    setUser({ commit }, data) {
      commit('setUser', data);
    },
    setOne({ commit }, data) {
      commit('setOne', data);
    },
    setShowLogin({ commit }, data) {
      commit('setShowLogin', data);
    },
    setShowChangeInfo({ commit }, data) {
      commit('setShowChangeInfo', data);
    },
  },
};
