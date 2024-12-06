import './Tooltip.scss';

import delay from 'lodash/delay';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

import * as utils from '../../utils/common';
import uuid from '../../utils/uuid';
import TooltipViewer from './TooltipViewer';

/* eslint-disable no-mixed-operators */

class Tooltip extends PureComponent {
  static getInnerOverflow(element) {
    return element.scrollWidth > element.offsetWidth || element.scrollHeight > element.offsetHeight;
  }
  static visibleAfterScroll(element, parents) {
    const percentX = 100;
    const percentY = 100;
    const tolerance = 0.05;
    const rect = element.getBoundingClientRect();
    return parents.every(parent => {
      const prect = parent.getBoundingClientRect();
      const visiblePixelX = Math.min(rect.right, prect.right) - Math.max(rect.left, prect.left);
      const visiblePixelY = Math.min(rect.bottom, prect.bottom) - Math.max(rect.top, prect.top);

      const visiblePercentageX = (visiblePixelX / rect.width) * 100;
      const visiblePercentageY = (visiblePixelY / rect.height) * 100;
      return visiblePercentageX + tolerance > percentX && visiblePercentageY + tolerance > percentY;
    });
  }
  constructor(props) {
    super(props);
    this._scrollNodes = [];
    this._id = uuid();
    this.mountTooltip = this.mountTooltip.bind(this);
    this.unmountTooltip = this.unmountTooltip.bind(this);
    this.showTooltip = this.showTooltip.bind(this);
    this.hideTooltip = this.hideTooltip.bind(this);
    this.delayShowTooltip = this.delayShowTooltip.bind(this);
    this.delayHideTooltip = this.delayHideTooltip.bind(this);
    this.hideTooltipBeforeScroll = this.hideTooltipBeforeScroll.bind(this);
    this.showForcedTooltipAfterScroll = this.showForcedTooltipAfterScroll.bind(this);
    this.state = { show: false };
  }
  componentDidMount() {
    this._mounted = true;
    if (this.props.forceVisibility !== undefined) {
      if (this.props.forceVisibility === true) {
        this.delayShowTooltip();
      } else {
        this.delayHideTooltip();
      }
    } else {
      this.detectTooltipRequired();
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (this._scrolling) {
      return;
    }
    if (this.props.forceVisibility !== undefined) {
      if (this.props.forceVisibility === true) {
        this.delayShowTooltip();
      } else {
        this.hideTooltip();
      }
    } else {
      if (prevState.show === false && this.state.show === true) {
        return;
      }
      this.detectTooltipRequired();
    }
  }
  componentWillUnmount() {
    this._mounted = false;
    this.unmountTooltip();
  }
  delayShowTooltip() {
    this._isHoveringTooltip = this.props.forceVisibility !== true;
    delay(() => this.showTooltip(), this.props.delay);
  }
  delayHideTooltip(delayTime = this.props.delay) {
    this._isHoveringTooltip = false;
    if (this.props.forceVisibility === true) {
      return;
    }
    delay(this.hideTooltip, delayTime);
  }
  detectTooltipRequired() {
    const { content, label } = this.props;
    const hasOverflow = Tooltip.getInnerOverflow(this.container);

    if (hasOverflow || label || content) {
      this.mountTooltip();
    } else {
      this.unmountTooltip();
    }
  }
  mountTooltip() {
    if (this.props.showOnHover !== false) {
      this.container.addEventListener('mouseenter', this.delayShowTooltip);
      this.container.addEventListener('mouseleave', this.delayHideTooltip);
    }
    this.container.classList.remove('el-tooltip--inactive');
  }
  unmountTooltip() {
    clearTimeout(this.tooltipTimeout);
    this.hideTooltip();
    if (this.props.showOnHover !== false) {
      this.container.removeEventListener('mouseenter', this.delayShowTooltip);
      this.container.removeEventListener('mouseleave', this.delayHideTooltip);
    }
    this.container.classList.add('el-tooltip--inactive');
  }
  showTooltip() {
    if (!this._mounted || !this._id || !this.container) {
      // stop if not mounted, not existing, no container available
      return;
    }
    if (this._isHoveringTooltip === false && this.props.forceVisibility !== true) {
      // do show tooltip afterDealy if not still hovered and not forced
      return;
    }
    if (!this._scrollNodes.length) {
      // listen for scroll in containers
      this._scrollNodes = utils.getScrollParents(this.container);
      this._scrollNodes.forEach(node => {
        node.addEventListener('scroll', this.hideTooltipBeforeScroll);
      });
    }

    if (!Tooltip.visibleAfterScroll(this.container, this._scrollNodes)) {
      return;
    }
    this.setState({ show: true });
  }
  hideTooltip() {
    if (this._mounted === false) {
      return;
    }
    if (this._isHoveringTooltip === true && this.props.forceVisibility === false) {
      return;
    }
    if (!this.state.show) {
      return;
    }
    if (this._scrollNodes.length) {
      this._scrollNodes.forEach(node => {
        node.removeEventListener('scroll', this.hideTooltipBeforeScroll);
      });
      this._scrollNodes = [];
    }
    this.setState({ show: false });
  }
  hideTooltipBeforeScroll() {
    this._scrolling = true;
    this.hideTooltip();
    clearTimeout(this.tooltipTimeout);
    this.tooltipTimeout = setTimeout(this.showForcedTooltipAfterScroll, 500);
  }
  showForcedTooltipAfterScroll() {
    this._scrolling = false;
    this.showTooltip();
  }

  render() {
    const {
      className,
      style,
      children,
      content,
      label,
      position,
      align,
      kind,
      custom,
    } = this.props;
    const tooltipClassName = utils.composeClassNames([
      'el-tooltip',
      custom && 'el-tooltip--custom',
      className,
    ]);

    let viewer = null;
    if (this.state.show) {
      viewer = (
        <TooltipViewer
          parentId={this._id}
          content={content}
          label={label}
          position={position}
          align={align}
          kind={kind}
          custom={custom}
        >
          {children}
        </TooltipViewer>
      );
    }

    return (
      <div
        className={tooltipClassName}
        style={style}
        ref={container => {
          this.container = container;
        }}
        id={this._id}
      >
        {children}
        {viewer}
      </div>
    );
  }
}

Tooltip.propTypes = {
  delay: PropTypes.number,
  forceVisibility: PropTypes.bool,
  showOnHover: PropTypes.bool,
  content: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.shape(),
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.node,
  ]),
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  align: PropTypes.oneOf(['start', 'center', 'end']),
  kind: PropTypes.oneOf(['regular', 'error', 'info', 'warning', 'neutral']),
  custom: PropTypes.bool,
};
Tooltip.defaultProps = {
  delay: 200,
  forceVisibility: undefined,
  showOnHover: undefined,
  content: undefined,
  children: null,
  className: undefined,
  style: {},
  label: undefined,
  position: undefined,
  align: undefined,
  kind: 'regular',
  custom: false,
};

export default Tooltip;
