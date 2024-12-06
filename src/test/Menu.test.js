import { mount, shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import React from 'react';

import Menu, { MenuItem, MenuSection } from '../components/Menu';

const onChangeMockEvent = jest.fn();

it('renders only the menu', () => {
  const wrapper = mount(<Menu path="/" pathname="/" onChange={onChangeMockEvent} />);
  expect(wrapper.find('.el-menu')).toHaveLength(1);
});

it('renders the menu wrapper also if pathname does not match any route', () => {
  const wrapper = mount(<Menu path="/" pathname="/test" onChange={onChangeMockEvent} />);
  expect(wrapper.find('.el-menu')).toHaveLength(1);
});

it('renders the menu items if parent root matches', () => {
  const wrapper = mount(
    <Menu path="/" pathname="/" onChange={onChangeMockEvent}>
      <MenuItem path="/foo" label="foo" />
      <MenuItem path="/bar" label="bar" />
    </Menu>,
  );
  expect(wrapper.find('.el-menu__item')).toHaveLength(2);
});

it('renders the menu items if child route matches', () => {
  const wrapper = mount(
    <Menu path="/" pathname="/foo" onChange={onChangeMockEvent}>
      <MenuItem path="/foo" label="foo" />
      <MenuItem path="/bar" label="bar" />
    </Menu>,
  );
  expect(wrapper.find('.el-menu__item')).toHaveLength(2);
});

it('renders the menu section with icons', () => {
  const wrapper = mount(
    <Menu path="/" pathname="/foo" onChange={onChangeMockEvent}>
      <MenuSection label="Menu Section" icon="access-manager-color">
        <MenuItem path="/foo" label="foo" />
        <MenuItem path="/bar" label="bar" />
      </MenuSection>
    </Menu>,
  );
  expect(wrapper.find('.el-menu__section-icon')).toHaveLength(1);
});

it('renders the menu items with icons', () => {
  const wrapper = mount(
    <Menu path="/" pathname="/foo" onChange={onChangeMockEvent}>
      <MenuSection label="Menu Section">
        <MenuItem path="/foo" label="foo" icon="admin-color" />
        <MenuItem path="/bar" label="bar" icon="application-color" />
      </MenuSection>
    </Menu>,
  );
  expect(wrapper.find('.el-menu__item__item-icon')).toHaveLength(2);
});

it('renders the menu items with named icon', () => {
  const wrapper = mount(
    <Menu path="/" pathname="/foo" onChange={onChangeMockEvent}>
      <MenuSection label="Menu Section">
        <MenuItem path="/foo" label="foo" namedIcon />
        <MenuItem path="/bar" label="bar" namedIcon />
      </MenuSection>
    </Menu>,
  );
  expect(wrapper.find('.el-menu__item__item-named-icon')).toHaveLength(2);
});

it('does not render the menu items if no route matches', () => {
  const wrapper = mount(
    <Menu path="/" pathname="/non-existing" onChange={onChangeMockEvent}>
      <MenuItem path="/foo" label="foo" />
      <MenuItem path="/bar" label="bar" />
    </Menu>,
  );
  expect(wrapper.find('.el-menu__item')).toHaveLength(0);
});

it('renders the nested child when asRoot prop is set and route matches parent', () => {
  const wrapper = mount(
    <Menu path="/" pathname="/foo" onChange={onChangeMockEvent}>
      <MenuItem path="/foo" label="foo" asRoot>
        <MenuItem path="/foo/nested" label="nested" />
      </MenuItem>
      <MenuItem path="/bar" label="bar" />
    </Menu>,
  );
  const menuItem = wrapper.find('.el-menu__item');
  expect(menuItem).toHaveLength(1);
  expect(menuItem.text()).toBe('nested');
  expect(wrapper.find('.el-menu__item')).toHaveLength(1);
});

it('renders the parent child if asRoot prop is not set and route matches parent', () => {
  const wrapper = mount(
    <Menu path="/" pathname="/foo" onChange={onChangeMockEvent}>
      <MenuItem path="/foo" label="foo">
        <MenuItem path="/foo/nested" label="nested" />
      </MenuItem>
      <MenuItem path="/bar" label="bar" />
    </Menu>,
  );
  const menuItems = wrapper.find('.el-menu__item');
  expect(menuItems).toHaveLength(2);
  expect(wrapper.find('.el-menu__item')).toHaveLength(2);
  expect(menuItems.at(0).text()).toBe('foo');
  expect(menuItems.at(1).text()).toBe('bar');
});

it('renders the nested child if matching if asRoot prop is not set ', () => {
  const wrapper = mount(
    <Menu path="/" pathname="/1st/2nd/3rd/4th" onChange={onChangeMockEvent}>
      <MenuItem path="/1st" label="1st Level">
        <MenuItem path="/1st/2nd" label="2st level">
          <MenuItem path="/1st/2nd/3rd" label="3nd level">
            <MenuItem path="/1st/2nd/3rd/4th" label="4th level" />
          </MenuItem>
        </MenuItem>
      </MenuItem>
    </Menu>,
  );

  const menuItem = wrapper.find('.el-menu__item');
  expect(menuItem).toHaveLength(1);
  expect(menuItem.text()).toBe('4th level');
});

it('renders the menu items when partial match is allowed', () => {
  const wrapper = mount(
    <Menu path="/" pathname="/foo/partial/match" onChange={onChangeMockEvent}>
      <MenuItem path="/foo" label="foo" partial />
      <MenuItem path="/bar" label="bar" />
    </Menu>,
  );
  const menuItem = wrapper.find('.el-menu__item');
  const activeMenuItem = wrapper.find('.el-menu__item--active');
  expect(menuItem).toHaveLength(2);
  expect(activeMenuItem.text()).toBe('foo');
});

it('renders the menu items when router param is used', () => {
  const wrapper = mount(
    <Menu path="/" pathname="/users/:user-id/settings" onChange={onChangeMockEvent}>
      <MenuItem path="/books" label="Books" />
      <MenuItem path="/users/:user-id" label="User" asRoot>
        <MenuItem path="/users/:user-id/account" label="account" />
        <MenuItem path="/users/:user-id/settings" label="settings" />
      </MenuItem>
    </Menu>,
  );
  const menuItem = wrapper.find('.el-menu__item');
  const activeMenuItem = wrapper.find('.el-menu__item--active');
  expect(menuItem).toHaveLength(2);
  expect(activeMenuItem.text()).toBe('settings');
});

it('renders the menu section if parent root matches', () => {
  const wrapper = mount(
    <Menu path="/" pathname="/" onChange={onChangeMockEvent}>
      <MenuSection label="Menu Section">
        <MenuItem path="/foo" label="foo" />
        <MenuItem path="/bar" label="bar" />
      </MenuSection>
    </Menu>,
  );
  const menuSection = wrapper.find('.el-menu__section');
  const menuSectionLabel = menuSection.find('.el-menu__section-label');
  expect(menuSectionLabel).toHaveLength(1);
  expect(menuSectionLabel.text()).toBe('Menu Section');
});

it('renders the Menu when no pathname is set', () => {
  const wrapper = mount(
    <Menu onChange={onChangeMockEvent}>
      <MenuItem label="foo" />
      <MenuItem label="bar" />
    </Menu>,
  );
  const menuItems = wrapper.find('.el-menu__item');
  expect(menuItems).toHaveLength(2);
});

it('renders the manually set active prop', () => {
  const wrapper = mount(
    <Menu onChange={onChangeMockEvent}>
      <MenuItem label="foo" active />
      <MenuItem label="bar" />
    </Menu>,
  );
  const activeMenuItem = wrapper.find('.el-menu__item--active');
  expect(activeMenuItem).toHaveLength(1);
  expect(activeMenuItem.text()).toBe('foo');
});

it('renders the disabled prop on menu item', () => {
  const wrapper = mount(
    <Menu onChange={onChangeMockEvent}>
      <MenuItem label="foo" disabled />
      <MenuItem label="bar" />
    </Menu>,
  );
  const disabledMenuItem = wrapper.find('.el-menu__item--disabled');
  expect(disabledMenuItem).toHaveLength(1);
  expect(disabledMenuItem.text()).toBe('foo');
});

it('does not render a hidden menu item', () => {
  const wrapper = mount(
    <Menu onChange={onChangeMockEvent}>
      <MenuItem label="foo" hidden />
      <MenuItem label="bar" />
    </Menu>,
  );
  const menuItems = wrapper.find('.el-menu__item');
  expect(menuItems).toHaveLength(1);
});

it('does not render a hidden menu section', () => {
  const wrapper = mount(
    <Menu onChange={onChangeMockEvent}>
      <MenuSection hidden>
        <MenuItem label="foo" />
        <MenuItem label="bar" />
      </MenuSection>
    </Menu>,
  );
  const menuSection = wrapper.find('.el-menu__section');
  expect(menuSection).toHaveLength(0);
});

it('trigger onChange when clicking a menu item', () => {
  const mockEvent = jest.fn();
  const wrapper = mount(
    <Menu path="/" pathname="/" onChange={mockEvent}>
      <MenuItem path="/foo" label="foo" />
      <MenuItem path="/bar" label="bar" />
    </Menu>,
  );
  const menuItems = wrapper.find('.el-menu__item');
  menuItems.at(0).simulate('click');
  expect(mockEvent).toHaveBeenCalled();
});

it('trigger onChange with correct value when clicking a menu item', () => {
  const mockEvent = jest.fn();
  const wrapper = mount(
    <Menu path="/" pathname="/" onChange={mockEvent}>
      <MenuItem path="/foo" label="foo" />
      <MenuItem path="/bar" label="bar" />
    </Menu>,
  );
  const menuItems = wrapper.find('.el-menu__item');
  menuItems.at(1).simulate('click');
  expect(mockEvent).toHaveBeenCalledWith('/bar');
});

// Snapshot
it('renders the menu correctly when multiple props are set', () => {
  const wrapper = mount(
    <Menu path="/" pathname="/foo" onChange={onChangeMockEvent}>
      <MenuItem path="/foo" label="foo" asRoot>
        <MenuItem path="/foo/nested" label="nested" />
      </MenuItem>
      <MenuItem path="/bar" label="bar" />
    </Menu>,
  );
  expect(shallowToJson(wrapper)).toMatchSnapshot();
});
