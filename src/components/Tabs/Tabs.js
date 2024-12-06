import './Tabs.scss';

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

import * as utils from '../../utils/common';
import keyCodes from '../../utils/keyCodes';

class Tab extends PureComponent {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }
  onClick(e) {
    if (!this.props.disabled && !this.props.selected) {
      this.props.onSelect(e);
    }
  }
  render() {
    const { selected, focused, children, disabled, hidden, flex, style } = this.props;
    if (hidden) {
      return null;
    }
    const className = utils.composeClassNames([
      'el',
      'el-tabs__tab-item',
      focused && 'el-tabs__tab-item--focused',
      selected && 'el-tabs__tab-item--selected',
      disabled && 'el-tabs__tab-item--disabled',
      flex && 'fill-width',
    ]);

    return (
      <div onClick={this.onClick} className={className} style={style} role="presentation">
        {children}
      </div>
    );
  }
}

Tab.propTypes = {
  children: PropTypes.node,
  selected: PropTypes.bool,
  focused: PropTypes.bool,
  onSelect: PropTypes.func,
  disabled: PropTypes.bool,
  hidden: PropTypes.bool,
  flex: PropTypes.bool,
  style: PropTypes.shape(),
};

Tab.defaultProps = {
  children: undefined,
  selected: false,
  focused: false,
  onSelect: undefined,
  disabled: false,
  hidden: false,
  flex: false,
  style: undefined,
};

const TabList = ({ children }) => children;

TabList.propTypes = {
  children: PropTypes.node,
};

TabList.defaultProps = {
  children: undefined,
};

const TabPanel = ({ children, flex, style, className }) => {
  const classNames = utils.composeClassNames([
    'el-tabs__tab__content',
    flex && 'el-tabs__tab__content--flexible',
    className,
  ]);
  return (
    <div className={classNames} style={style}>
      {children}
    </div>
  );
};

TabPanel.propTypes = {
  style: PropTypes.shape(),
  className: PropTypes.string,
  children: PropTypes.node,
  flex: PropTypes.bool,
};

TabPanel.defaultProps = {
  style: undefined,
  className: undefined,
  children: undefined,
  flex: false,
};

const TabPanels = ({ children }) => children;

TabPanels.propTypes = {
  children: PropTypes.node,
};

TabPanels.defaultProps = {
  children: undefined,
};

const TAB_TYPE = (<Tab />).type;
const TAB_PANEL_TYPE = (<TabPanel />).type;

const isTab = node => node.type === TAB_TYPE;
const isTabPanel = node => node.type === TAB_PANEL_TYPE;

class Tabs extends PureComponent {
  constructor(props) {
    super(props);

    const { selected, children } = this.props;
    const items = this.getTabs(children);
    let index = 0;
    if (typeof selected === 'string') {
      index = items.indexOf(selected);
    } else if (selected !== undefined) {
      index = selected;
    }

    this.state = {
      selected: Math.max(0, index),
      focused: undefined,
    };

    this.onSelect = this.onSelect.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);

    this.getTabListAndTabPanels = this.getTabListAndTabPanels.bind(this);
    this.getTabs = this.getTabs.bind(this);
    this.getPanels = this.getPanels.bind(this);

    this.testKey = this.testKey.bind(this);
    this.selectSiblingTab = this.selectSiblingTab.bind(this);
  }
  componentDidUpdate(prevProps) {
    let currentSelected = this.state.selected;
    if (prevProps.selected !== this.props.selected) {
      currentSelected = this.props.selected;
    }

    const tabs = this.getTabs();
    const { hidden, disabled } = tabs[currentSelected].props;
    if (hidden || disabled) {
      currentSelected = 0;
    }

    this.setState({ selected: currentSelected });
  }

  onSelect(evt, index) {
    this.setState({ selected: index, focused: index });

    this.input.focus();

    if (this.props.onSelect) {
      this.props.onSelect(evt, index);
    }
  }
  onFocus(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.focused === undefined) {
      this.setState(state => ({ focused: state.selected }));
    }
  }
  onBlur() {
    this.setState({ focused: undefined });
  }

  getTabListAndTabPanels() {
    const items = this.props.children;
    const subElements = Array.isArray(items) ? items : [items];
    const [tabList, tabPanels] = subElements;
    return [tabList, tabPanels];
  }
  getTabs() {
    const [tabList] = this.getTabListAndTabPanels();
    const { children } = tabList.props;
    const tabs = Array.isArray(children) ? children : [children];
    return tabs.filter(isTab);
  }
  getPanels() {
    const tabPanels = this.getTabListAndTabPanels()[1];
    let panels = [];
    if (tabPanels) {
      const { children } = tabPanels.props;
      panels = Array.isArray(children) ? children : [children];
    }
    return panels.filter(isTabPanel);
  }
  testKey(e) {
    const { keyCode, shiftKey } = e.nativeEvent;
    if (keyCode === keyCodes.KEY_TAB) {
      e.preventDefault();
      this.setState({ focused: undefined });
      utils.focusNextFocusableElement(this.input, !shiftKey);
      return;
    }
    if (keyCode === keyCodes.KEY_LEFT) {
      e.preventDefault();
      this.selectSiblingTab(false);
      return;
    }
    if (keyCode === keyCodes.KEY_RIGHT) {
      e.preventDefault();
      this.selectSiblingTab(true);
    }
  }
  selectSiblingTab(next) {
    const { selected } = this.state;
    const tabs = this.getTabs(this.props.children);
    let nextIndex = selected;
    const found = false;
    while (!found) {
      nextIndex += next ? 1 : -1;
      if (nextIndex === tabs.length || nextIndex < 0) {
        break;
      }
      if (!tabs[nextIndex].props.disabled) {
        this.setState({ selected: nextIndex, focused: nextIndex });
        break;
      }
    }
  }
  render() {
    const { selected, focused } = this.state;
    const { id, children, flex } = this.props;
    const [tabList] = this.getTabListAndTabPanels();
    let shouldRenderAsFlex = flex;

    const { width } = tabList.props.style || {};
    const growTab = width !== undefined;
    const tabs = this.getTabs(children).map((child, index) => {
      const props = {
        ...child.props,
        onSelect: evt => this.onSelect(evt, index),
        key: index,
        selected: selected === index && !child.props.disabled,
        focused: focused === index,
        flex: growTab,
      };
      return React.cloneElement(child, props);
    });

    const panels = this.getPanels();
    let panel = null;
    if (panels.length >= selected + 1) {
      if (tabs[selected].props.selected) {
        panel = panels[selected];
        shouldRenderAsFlex = flex || panel.props.flex;
        panel = React.cloneElement(panel, { ...panel.props, flex: shouldRenderAsFlex });
      }
    }

    const tabsClassNames = utils.composeClassNames([
      'element',
      'el-tabs',
      shouldRenderAsFlex === true && 'el-tabs--flexible',
    ]);

    return (
      <div className={tabsClassNames} id={id}>
        <input
          ref={input => {
            this.input = input;
          }}
          type="button"
          className="el__holder"
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onKeyDown={this.testKey}
        />
        <div className="el-tabs__tab-items" style={tabList.props.style}>
          {tabs}
        </div>
        {panel}
      </div>
    );
  }
}

Tabs.propTypes = {
  id: PropTypes.string,
  selected: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onSelect: PropTypes.func,
  disabled: PropTypes.bool,
  children: PropTypes.node,
  flex: PropTypes.bool,
};

Tabs.defaultProps = {
  id: 'el-tabs',
  selected: 0,
  onSelect: undefined,
  disabled: false,
  children: undefined,
  flex: false,
};

export { Tab, Tabs, TabList, TabPanel, TabPanels };
