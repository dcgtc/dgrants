import { createStore } from 'vuex';

export default createStore({
  state: {
    contract: '',
    grants: [
      {
        name: 'Apple',
        description: 'An apple a day keeps the doctor away.',
        price: '0.008',
        image: 'apple.jpg',
        units: 0,
      },
      {
        name: 'Orange',
        description: 'Oranges are low in calories and full of nutrients, they promote clear, healthy and skin.',
        price: '0.019',
        image: 'orange.jpg',
        units: 0,
      },
      {
        name: 'Banana',
        description: 'Bananas are one of the most widely consumed fruits in the world for good reason.',
        price: '0.015',
        image: 'banana.jpg',
        units: 0,
      },
    ],
  },
  mutations: {
    setGrantUnits(state, grantUnits) {
      const grant = state.grants.filter((item) => (item.name == grantUnits.name));
      if (grant && grant.length > 0) {
        grant[0].units = grantUnits.units;
      }
    },
    setContract(state, address) {
      state.contract = address;
    },
    clearGrantUnits(state) {
      const newGrants = state.grants.map((grant) => {
        grant.units = 0;
        return grant;
      });
      state.grants = newGrants;
    },
  },
  getters: {
    totalAmount: (state) => state.grants.reduce((accumulator, currentValue) => (accumulator + Number(currentValue.units) * parseFloat(currentValue.price)), 0),
    getGrantUnits: (state) => (name) => {
      const grant = state.grants.filter((item) => (item.name == name));
      if (grant && grant.length > 0) {
        return grant[0].units;
      }
      return 0;
    },
  },
  actions: {

  },
});
