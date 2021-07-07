import { createStore } from 'vuex';

export default createStore({
  state: {
    contract: '',
    grants: [
      {
        id: '3lkjfl2kjelfkjl2kj3lfkj2lkejflk2jelkfjl2kjelfkj',
        owner: '0x0f02je0fij20eijffijfeijiefj',
        payout: '0x000s0002130f23e0f0wdf02e0eef',
        metaPtr: 'lk2j3ljlf2kjelfkjl2kejfl',
        state: 1,
        replaces: '',
      },
      {
        id: '3984823lkj23jl2kjelfkj',
        owner: '0x0f023jflkj3je0fij20eijffijfeijiefj',
        payout: '0x000s000jl2k3jf2130f23e0f0wdf02e0eef',
        metaPtr: 'lk2jlkjlflkj3ljf3ljlf2kjelfkjl2kejfl',
        state: 1,
        replaces: '',
      },
    ],
  },
  mutations: {
    setContract(state, address) {
      state.contract = address;
    },
    setGrants(state, grants) {
      state.grants = grants;
    },
  },
  getters: {
    totalAmount: (state) => state.grants.reduce((accumulator, currentValue) => (accumulator + Number(currentValue.units) * parseFloat(currentValue.price)), 0),
  },
  actions: {

  },
});
