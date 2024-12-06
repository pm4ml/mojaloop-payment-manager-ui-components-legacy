import '../../icons/pm4ml/arrow.svg';
import './Header.scss';

import find from 'lodash/find';
import React, { PureComponent } from 'react';

import * as utils from '../../utils/common';
import Checkbox from '../Checkbox';
import ControlIcon from '../ControlIcon';
import Icon from '../Icon';
import Row from '../Row';
import Tooltip from '../Tooltip';

const Header = ({
  columns,
  sortColumn,
  sortAsc,
  onSortClick,
  filters,
  checked,
  semiChecked,
  disabledCheck,
  onCheckboxChange,
  onFilterChange,
  onFilterBlur,
  onFilterClick,
}) => {
  const headerCells = columns.map(column => {
    const filter = find(filters, { _index: column._index });
    return (
      <HeaderCell
        className={column.className}
        key={column._index}
        label={column.label}
        isCentered={column.centered}
        isCheckbox={column._onChange}
        isSearchable={column.searchable !== false}
        isSortable={column.sortable !== false && !column._onChange}
        isSorting={sortColumn === column._index}
        isSortingAsc={sortAsc}
        isFiltering={filter !== undefined}
        filter={filter}
        onClick={() => onSortClick(column._index)}
        checked={checked}
        semiChecked={semiChecked}
        disabledCheck={disabledCheck}
        onCheckboxChange={onCheckboxChange}
        onFilterChange={value => onFilterChange(column._index, value)}
        onFilterBlur={() => onFilterBlur(column._index)}
        onFilterClick={() => onFilterClick(column._index)}
      />
    );
  });

  return (
    <div className="el-datalist__header">
      <Row>{headerCells}</Row>
    </div>
  );
};

// Cell in the Header
class HeaderCell extends PureComponent {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.onFilterClick = this.onFilterClick.bind(this);
  }
  componentDidUpdate(prevProps) {
    if (this.props.isFiltering && !prevProps.isFiltering) {
      this._filter.focus();
    }
  }
  onClick() {
    if (this.props.isSortable) {
      this.props.onClick();
    }
  }
  onFilterClick(e) {
    this.props.onFilterClick();
    e.stopPropagation();
    e.preventDefault();
  }
  render() {
    const {
      className,
      label,
      isCentered,
      isCheckbox,
      isSearchable,
      isSortable,
      isSorting,
      isSortingAsc,
      isFiltering,
      filter,
      checked,
      semiChecked,
      disabledCheck,
      onCheckboxChange,
      onFilterChange,
      onFilterBlur,
    } = this.props;

    const headerCellClassName = utils.composeClassNames([
      'el-datalist__header-cell',
      isCheckbox && 'el-datalist__header-cell--checkbox',
      isSortable && 'el-datalist__header-cell--sortable',
      isSorting && 'el-datalist__header-cell--sorting',
      isFiltering && 'el-datalist__header-cell--filtering',
      className,
    ]);

    let headerCellContent = null;

    if (isCheckbox) {
      headerCellContent = (
        <Checkbox
          semi={!checked && semiChecked}
          checked={checked}
          onChange={onCheckboxChange}
          disabled={disabledCheck}
          round
        />
      );
    } else {
      headerCellContent = [];

      if (label !== '' && isSearchable) {
        headerCellContent.push(
          <FilterIcon key="filter-icon" isFiltering={isFiltering} onClick={this.onFilterClick} />,
        );
      }
      if (label !== '' && !isFiltering) {
        headerCellContent.push(
          <HeaderLabel key="header-label" label={label} isCentered={isCentered} />,
        );
      }
      if (label !== '' && isFiltering) {
        headerCellContent.push(
          <HeaderFilter
            key="header-filter"
            isFiltering={isFiltering}
            filter={filter}
            onFilterClick={this.onFilterClick}
            onFilterChange={onFilterChange}
            onFilterBlur={onFilterBlur}
            assignRef={input => {
              this._filter = input;
            }}
          />,
        );
      }
    }
    return (
      <div className={headerCellClassName} onClick={this.onClick} role="presentation">
        {headerCellContent}
        <SortIcon isSorting={isSorting} isSortingAsc={isSortingAsc} />
      </div>
    );
  }
}

const HeaderLabel = ({ label, isCentered }) => {
  const labelClassName = utils.composeClassNames([
    'el-datalist__header-cell__label',
    isCentered && 'el-datalist__header-cell__label--centered',
  ]);
  return (
    <div className={labelClassName}>
      <Tooltip style={{ flex: '0 0 auto' }}>{label}</Tooltip>
    </div>
  );
};

const HeaderFilter = ({ filter, onFilterClick, onFilterChange, onFilterBlur, assignRef }) => (
  <input
    type="text"
    className="el-datalist__header-cell__filter"
    value={filter.value || ''}
    onClick={onFilterClick}
    onChange={e => onFilterChange(e.target.value)}
    onBlur={onFilterBlur}
    ref={assignRef}
  />
);

const FilterIcon = ({ isFiltering, onClick }) => {
  const searchIconClassName = utils.composeClassNames([
    'el-datalist__header-cell__search-icon',
    isFiltering && 'el-datalist__header-cell__search-icon--active',
  ]);

  return (
    <div className={searchIconClassName}>
      <ControlIcon
        icon="search-small"
        size={15}
        onClick={onClick}
        kind={!isFiltering ? 'default' : 'warning'}
        active={isFiltering}
      />
    </div>
  );
};

const SortIcon = ({ isSorting, isSortingAsc }) => {
  if (!isSorting) {
    return null;
  }

  const iconClassName = utils.composeClassNames([
    'el-datalist__header-cell__sort-icon',
    isSortingAsc && 'el-datalist__header-cell__sort-icon--asc',
  ]);

  return <Icon className={iconClassName} name="arrow" size={10} />;
};

export default Header;
