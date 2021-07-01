import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import HelloWorld from '@/components/LayoutFooter.vue';

describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message';
    const wrapper = shallowMount(HelloWorld, {
      props: { msg },
    });
    expect(wrapper.text()).to.include(msg);
  });
});
