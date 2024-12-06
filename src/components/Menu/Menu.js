import './Menu.scss';
import '../../icons/mule/back-small.svg';

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

import * as utils from '../../utils/common';
import { NamedIcon } from '../Common';
import Icon from '../Icon';

const getPathMatches = (pathname, path, partial) => {
  if (!path) {
    return false;
  }
  if (partial && pathname.startsWith(path)){
    return true;
  }
  if (path === pathname) {
    return true;
  }

  const pathChunks = path.split('/');
  const pathNameChunks = pathname.split('/');

  if (pathChunks.length !== pathNameChunks.length) {
    return false;
  }

  return pathNameChunks.every((chunk, index) => {
    const pathChunk = pathChunks[index];
    const isExact = pathChunk === chunk;
    const isWild = pathChunk !== undefined && pathChunk.startsWith(':');
    return isExact || isWild;
  });
  
};

const bindOnClickProp = onClick => element =>
  React.cloneElement(element, {
    ...element.props,
    onClick,
  });

const bindPathnameProp = pathname => element =>
  React.cloneElement(element, {
    ...element.props,
    pathname,
  });

const bindActiveProp = pathname => element => {
  const { path, partial, back, active } = element.props;
  const pathMatches = getPathMatches(pathname, path, partial) && !back;
  if (pathMatches || active) {
    return React.cloneElement(element, {
      ...element.props,
      active: true,
    });
  }
  return element;
};
const bindKey = (element, index) =>
  React.cloneElement(element, {
    ...element.props,
    key: index.toString(),
  });

const bindDisabledProp = disabled => element =>
  React.cloneElement(element, {
    ...element.props,
    disabled: element.props.disabled || disabled,
  });

class MenuItem extends PureComponent {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }
  onClick() {
    if (!this.props.disabled) {
      this.props.onClick(this.props.to || this.props.path);
    }
  }
  render() {
    const { label, icon, fill, size, disabled, hidden, active, back, namedIcon } = this.props;
    if (hidden) {
      return null;
    }
    let backIcon = null;
    if (back) {
      backIcon = <Icon className="el-menu__item__back-icon" name="arrow" size={10} fill="#999" />;
    }
    let itemIcon = null;

    if (icon) {
      itemIcon = (
        <div className="el-menu__item__item-icon">
          <Icon className="el-menu__item__icon" name={icon} size={size} fill={fill} />
        </div>
      );
    } else if (namedIcon) {
      itemIcon = (
        <div className="el-menu__item__item-named-icon">
          <NamedIcon namedIconTitle={label} />
        </div>
      );
    }
    const classNames = utils.composeClassNames([
      'el-menu__item',
      active && 'el-menu__item--active',
      disabled && 'el-menu__item--disabled',
      back && 'el-menu__item--back',
      icon && 'el-menu__item--with-icon',
    ]);

    return (
      <div className={classNames} onClick={this.onClick} role="presentation">
        {backIcon}
        {itemIcon}
        {label}
      </div>
    );
  }
}

MenuItem.defaultProps = {
  path: undefined,
  to: undefined,
  disabled: false,
  hidden: false,
  back: false,
  icon: undefined,
  namedIcon: false,
  fill: undefined,
  size: 14,
  asRoot: false,
  partial: false,
};
MenuItem.propTypes = {
  path: PropTypes.string,
  to: PropTypes.string,
  disabled: PropTypes.bool,
  hidden: PropTypes.bool,
  back: PropTypes.bool,
  icon: PropTypes.string,
  namedIcon: PropTypes.bool,
  fill: PropTypes.string,
  size: PropTypes.number,
  // prop asRoot is not used directly by the MenuItem but it is used by the Menu component
  // eslint-disable-next-line react/no-unused-prop-types
  asRoot: PropTypes.bool,
  // prop partial is not used directly by the MenuItem but it is used by the Menu component
  // eslint-disable-next-line react/no-unused-prop-types
  partial: PropTypes.bool,
};

const MENU_ITEM_TYPE = (<MenuItem />).type;

const isMenuItem = node => node.type === MENU_ITEM_TYPE;

const MenuSection = ({
  pathname,
  label,
  children,
  onClick,
  hidden,
  disabled,
  icon,
  size,
  fill,
}) => {
  if (hidden) {
    return null;
  }
  const menuItems = React.Children.toArray(children)
    .filter(element => isMenuItem(element))
    .map(bindOnClickProp(onClick))
    .map(bindActiveProp(pathname))
    .map(bindDisabledProp(disabled));

  let itemIcon = null;
  if (icon) {
    itemIcon = (
      <div className="el-menu__section-icon">
        <Icon name={icon} size={size} fill={fill} />
      </div>
    );
  }

  let menuSectionLabel = null;
  if (label) {
    menuSectionLabel = (
      <div className="el-menu__section-label">
        {itemIcon}
        {label}
      </div>
    );
  }

  const classNames = utils.composeClassNames([
    'el-menu__section',
    disabled && 'el-menu__section--disabled',
  ]);

  return (
    <div className={classNames}>
      {menuSectionLabel}
      <div className="el-menu__section-items">{menuItems}</div>
    </div>
  );
};

MenuSection.defaultProps = {
  label: undefined,
  icon: undefined,
  fill: '#7C7C7C',
  disabled: false,
  size: 14,
};
MenuSection.propTypes = {
  label: PropTypes.string,
  icon: PropTypes.string,
  fill: PropTypes.string,
  size: PropTypes.number,
  disabled: PropTypes.bool,
};

const MENU_SECTION_TYPE = (<MenuSection />).type;

const isMenuSection = node => node.type === MENU_SECTION_TYPE;

const MenuItemsGroup = ({ children }) => <div className="el-menu__section-items">{children}</div>;

const wrapItemsInSections = items => {
  const groupedMenuItems = [];
  let currentGroup = [];
  const addCurrenntGroupToGroupedItems = () => {
    if (currentGroup.length) {
      groupedMenuItems.push(<MenuItemsGroup>{currentGroup}</MenuItemsGroup>);
      currentGroup = [];
    }
  };

  items.forEach(node => {
    if (isMenuSection(node) || node.props.back) {
      addCurrenntGroupToGroupedItems();
      groupedMenuItems.push(node);
    } else {
      currentGroup.push(node);
    }
  });

  addCurrenntGroupToGroupedItems();
  return groupedMenuItems.map(bindKey);
};

class Menu extends PureComponent {
  static flattenMenuSections(items) {
    // It flattens nested MenuSection, MenuItem components into a one-level array
    return items.reduce(
      (prevItems, currentItem) => [
        ...prevItems,
        ...(isMenuSection(currentItem)
          ? Menu.flattenMenuSections(React.Children.toArray(currentItem.props.children))
          : [currentItem]),
      ],
      [],
    );
  }
  constructor() {
    super();
    this.getActiveNode = this.getActiveNode.bind(this);
  }
  getActiveNode(parentNode) {
    const { pathname } = this.props;
    let activeNode = null;
    // render Menu when pathname matches path
    if (getPathMatches(pathname, parentNode.props.path, parentNode.props.partial)) {
      return parentNode;
    }
    // Default to Menu when going manual - no route matching
    if (parentNode === this && parentNode.props.pathname === undefined) {
      activeNode = parentNode;
    }

    // Flatten MenuSections in order not to have nested children when detecting active menu
    const items = Menu.flattenMenuSections(React.Children.toArray(parentNode.props.children));

    items.some(node => {
      // find the first matching menu item and return the parent or the item itself
      // depending if needs to be treated like a root
      if (isMenuItem(node)) {
        const { path, asRoot, partial, children, active } = node.props;
        const pathMatches = getPathMatches(pathname, path, partial);

        if (pathMatches || active) {
          // asRoot prop is meant to be used when menu has child elements
          // and we do not want to render the parent node but the child nodes
          activeNode = asRoot ? node : parentNode;
        } else if (children !== undefined) {
          activeNode = this.getActiveNode(node);
        }
      }
      return activeNode;
    });

    return activeNode;
  }

  render() {
    const { pathname, onChange } = this.props;
    let menuComponents = null;
    const activeNode = this.getActiveNode(this);

    if (activeNode !== null) {
      menuComponents = React.Children.toArray(activeNode.props.children);
      menuComponents = wrapItemsInSections(
        menuComponents
          .filter(element => isMenuItem(element) || isMenuSection(element))
          .map(bindOnClickProp(onChange))
          .map(bindPathnameProp(pathname))
          .map(bindActiveProp(pathname)),
      );
    }
    return <div className="mb-element el-menu">{menuComponents}</div>;
  }
}

Menu.defaultProps = {
  path: undefined,
  pathname: undefined,
};
Menu.propTypes = {
  // prop path is not used directly but it is used in getActiveNode
  // eslint-disable-next-line react/no-unused-prop-types
  path: PropTypes.string,
  pathname: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default Menu;
export { MenuItem, MenuSection };
