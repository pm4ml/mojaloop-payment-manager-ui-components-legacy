import './DataList.scss';

import find from 'lodash/find';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import orderBy from 'lodash/orderBy';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

import * as utils from '../../utils/common';
import uuid from '../../utils/uuid';
import Checkbox from '../Checkbox';
import { ErrorMessage, NoData, Pending } from './Boxes';
import Header from './Header';
import Link from './Link';
import Paginator from './Paginator';
import Rows from './Rows';

class DataList extends PureComponent {
  static getCheckedItems(list, checked) {
    if (typeof checked === 'function') {
      return list.filter(checked);
    } else if (Array.isArray(checked)) {
      return checked;
    }
    return undefined;
  }
  static isItemChecked(item) {
    return item._checked === true;
  }
  static isCheckable(checkable, item) {
    if (typeof checkable !== 'function') {
      return true;
    }
    return checkable(item._source);
  }
  static getSelectedItems(list, selected) {
    if (typeof selected === 'function') {
      return list.filter(selected);
    } else if (Array.isArray(selected)) {
      return selected;
    } else if (typeof selected === 'object') {
      return [selected];
    }
    return undefined;
  }
  static convertColumns(columns, prevColumns = [], onCheck) {
    const tpmColumns = [];
    let translateIndex = 0;

    if (prevColumns.some(col => col._onChange)) {
      // detect if any of the previous columns was the checkbox
      // and set and a translation index to properly get the right column
      translateIndex = 1;
    }
    if (typeof onCheck === 'function') {
      translateIndex = 1;
      tpmColumns.push({
        _index: '_checkbox_column',
        _onChange: onCheck,
      });
    }

    const mapIndexToColumns = prev => (column, i) => {
      tpmColumns.push({
        // get the _index key from the already existing columns if available
        // so that it does not change and worn't break sorting or filtering
        // because they use the column _index key to identify the column
        _index: get(prev, `[${i + translateIndex}]._index`) || uuid(),
        ...column,
      });
    };

    columns.forEach(mapIndexToColumns(prevColumns));
    return tpmColumns;
  }
  static toItems(list, columns, selected, checked, checkable, prevItems, prevList = []) {
    // applies the column configuration to the list
    // so that child components will not need any transformation logic
    const reduceColumns = (row, _rowIndex, _position) => (prev, column) => {
      const { func, key, link, _index, _onChange } = column;
      const originalValue = get(row._source, key);
      let value = originalValue;
      let component = null;

      if (typeof func === 'function') {
        value = func(value, row._source, _position);
      }
      if (typeof link === 'function') {
        // eslint-disable-next-line
        component = <Link onClick={() => link(row._source[key], row._source)}>{value}</Link>;
      } else if (_onChange) {
        if (DataList.isCheckable(checkable, row)) {
          component = <Checkbox onChange={() => _onChange(_rowIndex)} round />;
        }
      }

      const isTextContent = typeof value === 'string' || typeof value === 'number';

      if (React.isValidElement(value)) {
        component = value;
      }

      return {
        ...prev,
        [_index]: {
          originalValue,
          value: isTextContent ? value : null,
          component,
        },
      };
    };

    const mapListRowToItem = (oldItems, oldList) => (item, _position) => {
      let row;
      if (isEqual(item, oldList[_position])) {
        // use last item if available so that the internal index does
        // not change, keeping eveything working faster
        row = find(oldItems, { _position });
      } else {
        row = {
          _position,
          _index: uuid(),
          _source: item,
          _visible: true,
        };
      }

      row._selected = selected
        ? selected.some(select => isEqual(select, item))
        : get(oldItems, `[${_position}]._selected`);

      row._checked = checked
        ? checked.some(check => isEqual(check, item))
        : get(oldItems, `[${_position}]._checked`);

      row.data = columns.reduce(reduceColumns(row, row._index, _position), {});
      return row;
    };

    return list.map(mapListRowToItem(prevItems, prevList));
  }
  static filterItems(items, columns, filters) {
    const filtersByKey = filters.filter(item => item.value !== '');

    const matchingRows = item => ({
      ...item,
      _visible: filtersByKey.every(filter => {
        const { _index, value } = filter;
        let cell = get(item.data[_index], 'value');
        if (typeof cell === 'number') {
          cell = cell.toString();
        }
        if (typeof cell === 'string') {
          return cell.toLowerCase().includes(value.toLowerCase());
        }

        return false;
      }),
    });

    return items.map(matchingRows);
  }
  static sortItems(items, asc, _index) {
    // sorts the items by the column key and the direction
    const getContentAtIndex = key => item => {
      const value = get(item.data[key], 'value');
      if (value === null) {
        // get the original value before transformation
        return get(item.data[key], 'originalValue');
      }
      return value;
    };
    return orderBy(items, getContentAtIndex(_index), asc ? 'asc' : 'desc');
  }
  static getSortColumn(label, columns) {
    let sortColumn;
    columns.some(column => {
      if (!column._onChange && !(column.sortable === false)) {
        sortColumn = column._index;
        return true;
      }
      return false;
    });
    // gets the key of the sorting column
    if (label !== undefined) {
      const columnByLabel = find(columns, column => {
        return column.label === label && column.sortable !== false;
      });
      sortColumn = get(columnByLabel, '_index');
    }
    return sortColumn;
  }
  static getFilters(filters, _index, value) {
    const filter = find(filters, { _index });

    if (!filter) {
      // add the filter if does not exist
      return [...filters, { _index, value: value || '' }];
    }
    if (value !== undefined) {
      // change the value for an existing filter
      const index = filters.indexOf(filter);
      return [...filters.slice(0, index), { _index, value }, ...filters.slice(index + 1)];
    }
    if (filter.value === '') {
      // if the filter has 0 len string, remove it
      const index = filters.indexOf(filter);
      return [...filters.slice(0, index), ...filters.slice(index + 1)];
    }
    // there was no value but the filter exists, do not change anything
    return filters;
  }

  static getAmountOfPages(pageSize, items) {
    return Math.ceil(items.length / pageSize);
  }

  static getVisibleItems(items) {
    return items.filter(item => item._visible);
  }

  constructor(props) {
    super(props);

    this.onSortClick = this.onSortClick.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.onFilterBlur = this.onFilterBlur.bind(this);
    this.onFilterClick = this.onFilterClick.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
    this.onHeaderCheckboxChange = this.onHeaderCheckboxChange.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onItemCheck = this.onItemCheck.bind(this);
    this.onPageClick = this.onPageClick.bind(this);

    this._pageSize = props.pageSize;

    this._columns = DataList.convertColumns(
      this.props.columns,
      undefined,
      this.props.onCheck ? this.onItemCheck : undefined,
    );

    let checkedItems;
    if (this.props.checked) {
      checkedItems = DataList.getCheckedItems(this.props.list, this.props.checked);
    }

    let selectedItems;
    if (this.props.selected) {
      selectedItems = DataList.getSelectedItems(this.props.list, this.props.selected);
    }

    const sortAsc = this.props.sortAsc === true;
    const sortColumn = DataList.getSortColumn(this.props.sortColumn, this._columns);
    const items = DataList.toItems(
      this.props.list,
      this._columns,
      selectedItems,
      checkedItems,
      this.props.checkable,
      undefined,
      undefined,
    );

    const sortedItems = DataList.sortItems(items, sortAsc, sortColumn);

    this.state = {
      items: sortedItems,
      sortAsc,
      sortColumn,
      filters: [],
      selectedPage: 1,
    };
  }
  componentDidUpdate(prevProps) {
    const { list, columns, selected, checked, checkable, onCheck, filters } = this.props;
    const didColumnsChange = prevProps.columns !== columns;
    const didListChange = prevProps.list !== list;
    const didFiltersChange = prevProps.filters !== filters && !isEqual(filters, this.state.filters);
    const didOnCheckChange = onCheck !== prevProps.onCheck && !prevProps.onCheck;

    if (didColumnsChange || didOnCheckChange) {
      this._columns = DataList.convertColumns(
        columns,
        this._columns,
        onCheck ? this.onItemCheck : undefined,
      );
    }
    if (didColumnsChange || didListChange || didOnCheckChange || didFiltersChange) {
      const { sortAsc, sortColumn, items } = this.state;
      const checkedItems = DataList.getCheckedItems(list, checked);
      const selectedItems = DataList.getSelectedItems(list, selected);

      const listItems = DataList.toItems(
        list,
        this._columns,
        selectedItems,
        checkedItems,
        checkable,
        items,
        prevProps.list,
      );

      const currentFilters = filters || this.state.filters;
      const filteredItems = DataList.filterItems(listItems, this._columns, currentFilters);
      const sortedItems = DataList.sortItems(filteredItems, sortAsc, sortColumn);

      const pages = DataList.getAmountOfPages(
        this._pageSize,
        DataList.getVisibleItems(sortedItems),
      );

      this.setState({
        items: sortedItems,
        filters: currentFilters,
        selectedPage: Math.min(this.state.selectedPage, pages)
      });
    }
  }
  onSortClick(sortColumn) {
    const sortAsc = this.state.sortColumn === sortColumn ? !this.state.sortAsc : true;
    const items = DataList.sortItems(this.state.items, sortAsc, sortColumn);

    this.setState({
      sortAsc,
      sortColumn,
      items,
    });
  }
  onFilterChange(_index, value) {
    const filters = DataList.getFilters(this.state.filters, _index, value);
    const items = DataList.filterItems(this.state.items, this._columns, filters);

    this.setState(
      {
        items,
        filters,
        selectedPage: 1,
      },
      () => {
        if (this.props.onFilter) {
          this.props.onFilter({
            items: DataList.getVisibleItems(items).map(i => i._source),
            filters,
          });
        }
      },
    );
  }
  onFilterBlur(_index) {
    const filters = DataList.getFilters(this.state.filters, _index);
    this.setState({ filters });
  }
  onFilterClick(_index) {
    const filters = DataList.getFilters(this.state.filters, _index);
    this.setState({ filters });
  }

  onItemClick(id) {
    const { items } = this.state;
    const { onSelect, onUnselect } = this.props;
    const item = find(items, { _index: id });
    const eventHandler = item._selected ? onUnselect : onSelect;
    if (typeof eventHandler === 'function') {
      eventHandler(item._source);
    }
  }

  onItemCheck(id) {
    const idx = this.state.items.findIndex(c => c._index === id);
    this.setState(
      {
        items: [
          ...this.state.items.slice(0, idx),
          {
            ...this.state.items[idx],
            _checked: !this.state.items[idx]._checked,
          },
          ...this.state.items.slice(idx + 1),
        ],
      },
      this.onChange,
    );
  }

  onHeaderCheckboxChange(value) {
    const setCheckIfCheckable = _checked => item => ({
      ...item,
      _checked: DataList.isCheckable(this.props.checkable, item) ? _checked : false,
    });

    this.setState(
      {
        items: this.state.items.map(setCheckIfCheckable(value)),
      },
      this.onChange,
    );
  }

  onChange() {
    const sourceCheckedItems = this.state.items
      .filter(item => item._checked === true)
      .map(item => item._source);

    this.props.onCheck(sourceCheckedItems);
  }

  onPageClick(selectedPage) {
    this.setState({ selectedPage });
  }

  render() {
    const { flex, isPending, noData, errorMsg, hasError, checkable, paginatorSize } = this.props;
    const { items, sortAsc, sortColumn, filters, selectedPage } = this.state;
    const className = utils.composeClassNames([
      'mb-element',
      'el-datalist',
      flex && 'el-datalist--flexible',
    ]);

    const checkableItems = items.filter(item => DataList.isCheckable(checkable, item));
    const isAllChecked = checkableItems.length > 0 && checkableItems.every(DataList.isItemChecked);
    const isSomeChecked = checkableItems.length > 0 && checkableItems.some(DataList.isItemChecked);

    let content = null;
    if (isPending) {
      content = <Pending />;
    } else if (hasError) {
      content = <ErrorMessage message={errorMsg} />;
    } else if (items.length === 0 && filters.length === 0) {
      content = <NoData message={noData} />;
    } else {
      let paginator = null;
      let data = items;

      if (this._pageSize > 0) {
        data = DataList.getVisibleItems(data);
        const pages = DataList.getAmountOfPages(this._pageSize, data);

        if (pages > 1 && selectedPage >= 1 && selectedPage <= pages) {
          const start = (selectedPage - 1) * this._pageSize;
          data = data.slice(start, start + this._pageSize);

          paginator = (
            <Paginator
              key="datalist-paginator"
              count={paginatorSize}
              pages={pages}
              selectedPage={selectedPage}
              onPageClick={this.onPageClick}
            />
          );
        }
      }

      content = [
        <Header
          key="datalist-header"
          columns={this._columns}
          sortColumn={sortColumn}
          sortAsc={sortAsc}
          onSortClick={this.onSortClick}
          filters={filters}
          checked={isAllChecked}
          semiChecked={isSomeChecked}
          disabledCheck={checkableItems.length === 0}
          onCheckboxChange={this.onHeaderCheckboxChange}
          onFilterChange={this.onFilterChange}
          onFilterBlur={this.onFilterBlur}
          onFilterClick={this.onFilterClick}
        />,
        <Rows
          key="datalist-rows"
          items={data}
          columns={this._columns}
          onItemClick={this.onItemClick}
        />,
        paginator,
      ];
    }

    return <div className={className}>{content}</div>;
  }
}

DataList.defaultProps = {
  flex: true,
  pageSize: undefined,
  paginatorSize: 7,
  columns: [],
  list: [],
  sortAsc: true,
  sortColumn: undefined,
  isPending: false,
  hasError: false,
  selected: undefined,
  checked: undefined,
  checkable: undefined,
  noData: 'No items',
  errorMsg: 'There was an error',
  onSelect: undefined,
  onUnselect: undefined,
  onCheck: undefined,
  onFilter: undefined,
};

DataList.propTypes = {
  flex: PropTypes.bool,
  pageSize: PropTypes.number,
  paginatorSize: PropTypes.number,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      disableTooltip: PropTypes.bool,
      label: PropTypes.string,
      key: PropTypes.string,
      func: PropTypes.func,
      className: PropTypes.string,
      link: PropTypes.func,
      sortable: PropTypes.bool,
      searchable: PropTypes.bool,
    }),
  ),
  list: PropTypes.arrayOf(PropTypes.shape()),
  sortAsc: PropTypes.bool,
  sortColumn: PropTypes.string,
  isPending: PropTypes.bool,
  hasError: PropTypes.bool,
  selected: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape(),
    PropTypes.arrayOf(PropTypes.shape()),
  ]),
  checked: PropTypes.oneOfType([PropTypes.func, PropTypes.arrayOf(PropTypes.shape())]),
  checkable: PropTypes.func,
  noData: PropTypes.string,
  errorMsg: PropTypes.string,
  onSelect: PropTypes.func,
  onUnselect: PropTypes.func,
  onCheck: PropTypes.func,
  onFilter: PropTypes.func,
};

export default DataList;
