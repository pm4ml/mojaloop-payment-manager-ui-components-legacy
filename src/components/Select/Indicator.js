import '../../icons/pm4ml/arrow.svg';

import PropTypes from 'prop-types';
import React from 'react';

import Icon from '../Icon';

const indicatorSizes = {
  s: 8,
  m: 9,
  l: 10,
};

const Indicator = ({ isOpen, size }) => (
  <Icon
    className="input-select__indicator"
    name="arrow"
    style={{
      marginTop: '2px',
      transform: `rotateZ(90deg) rotateY(${isOpen ? '180' : 0}deg)`,
    }}
    size={indicatorSizes[size]}
    fill="rgba(0,0,0,0.5)"
  />
);

Indicator.propTypes = {
  isOpen: PropTypes.bool,
  size: PropTypes.oneOf(['s', 'm', 'l']),
};
Indicator.defaultProps = {
  isOpen: false,
  size: 'l',
};

export default Indicator;
