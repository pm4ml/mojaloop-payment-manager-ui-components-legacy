/* eslint no-console: "off" */
/* eslint-disable */
import React, { PureComponent } from 'react';
import Row from '../../components/Row';
import TextField from '../../components/TextField';
import Checkbox from '../../components/Checkbox';
import Button from '../../components/Button';
import Menu, { MenuItem, MenuSection } from '../../components/Menu';

const Menu0 = ({ pathname, onChange, disabled, hidden }) => (
  <Menu path="/" pathname={pathname} onChange={onChange}>
    <MenuItem path="/user/:user-id" to="/user/:user-id/overview" label="user" asRoot>
      <MenuItem to="/" label="initial" back />
      <MenuSection path="/user/:user-id" label="Books">
        <MenuItem path="/user/:user-id/overview" label="User overview" />
        <MenuItem path="/user/:user-id/settings" label="User settings" />
      </MenuSection>
    </MenuItem>
    <MenuItem path="/books" label="books" asRoot>
      <MenuSection label="Books">
        <MenuItem path="/books/most-read" label="most read" />
        <MenuItem path="/books/most-sold" label="most sold" />
      </MenuSection>
    </MenuItem>
  </Menu>
);
const Menu1 = ({ pathname, onChange, disabled, hidden }) => (
  <Menu path="/" pathname={pathname} onChange={onChange}>
    <MenuItem path="/tracking" label="Tracking" hidden={hidden} />
    <MenuItem path="/partners" label="Partners" disabled={disabled} asRoot>
      <MenuSection label="User Info">
        <MenuItem
          path="/partners/partner/contacts"
          label="Contacts"
          icon="circle"
          fill="#c33"
          size={6}
        />
        <MenuItem path="/partners/partner/identifiers" label="Identifiers" disabled={disabled} />
      </MenuSection>

      <MenuSection label="Format Defaults" icon="access-manager-color">
        <MenuItem path="/partners/partner/csv" label="CSV" icon={undefined} namedIcon={true} />
        <MenuItem path="/partners/partner/edifact" label="EDIFACT" icon="application-color" />
        <MenuItem path="/partners/partner/x12" label="X12" icon="calendar-small" back />
        <MenuItem
          path="/partners/partner/apps"
          label="Partners and Applications and this is a very long text"
          icon={undefined}
          namedIcon={true}
        />
      </MenuSection>

      <MenuSection label="Configuration">
        <MenuItem path="/partners/partner/documentDefinitions" label="Document Definitions">
          <MenuItem
            path="/partners/partner/documentDefinitions/documentDefinition"
            to="/partners/partner/documentDefinitions"
            label="Document Definitions"
            back
          />
        </MenuItem>
      </MenuSection>
    </MenuItem>

    <MenuItem path="/administration" label="administration" asRoot disabled={disabled}>
      <MenuItem to="/" label="Administration" back />
      <MenuItem path="/administration/errorcodes" label="Error Codes" partial>
        <MenuItem
          path="/administration/errorcodes/errorCode"
          to="/administration/errorcodes"
          label="Error Code"
          back
        />
      </MenuItem>
    </MenuItem>
  </Menu>
);

const Menu2 = ({ pathname, onChange, disabled, hidden }) => (
  <Menu onChange={onChange}>
    <MenuItem label="1" hidden={hidden} />
    <MenuItem label="2" />
    <MenuItem label="3" hidden={hidden} active />
    <MenuItem label="4" />
    <MenuItem label="5" hidden={hidden} />
  </Menu>
);

const Menu3 = ({ pathname, onChange }) => (
  <Menu path="/" pathname={pathname} onChange={onChange}>
    <MenuItem label="/route" path="/route" />
    <MenuItem label="/route/other" path="/route/other" />
    <MenuItem label="/route/other/subroute" path="/route/other/subroute" partial />
    <MenuItem label="/route/other/subroute/xyz/tre" path="/route/other/subroute/xyz/tre" />
  </Menu>
);

class MenuTester extends PureComponent {
  constructor() {
    super();
    this.onChangePath = this.onChangePath.bind(this);
    this.onMenuChange = this.onMenuChange.bind(this);
    this.onChangeDisabled = this.onChangeDisabled.bind(this);
    this.onChangeHidden = this.onChangeHidden.bind(this);
    this.state = {
      pathname: '/',
      disabled: false,
      hidden: false,
    };
  }
  onMenuChange(pathname) {
    if (pathname !== this.state.pathname) {
      this.setState({ pathname });
    }
  }
  onChangePath(pathname) {
    if (pathname !== this.state.pathname) {
      this.setState({ pathname });
    }
  }
  onChangeDisabled() {
    this.setState({
      disabled: !this.state.disabled,
    });
  }
  onChangeHidden() {
    this.setState({
      hidden: !this.state.hidden,
    });
  }
  render() {
    const style = { margin: '5px' };
    const componentWithProps = React.cloneElement(this.props.children, {
      ...this.props.children.props,
      pathname: this.state.pathname,
      onChange: this.onMenuChange,
      disabled: this.state.disabled,
      hidden: this.state.hidden,
    });
    return (
      <div style={{ ...style, border: '3px solid #eee' }}>
        <Row align="left">
          <TextField
            onChange={this.onChangePath}
            value={this.state.pathname}
            style={{ ...style, width: '300px' }}
          />
          <Button
            onClick={() => this.onChangePath('/partners/partner/contacts')}
            label="Go To Contacts"
            style={style}
          />
        </Row>
        <Row align="left">
          <Checkbox
            onChange={this.onChangeDisabled}
            checked={this.state.disabled}
            label="Disable"
            style={style}
          />

          <Checkbox
            onChange={this.onChangeHidden}
            checked={this.state.hidden}
            label="Hide"
            style={style}
          />
        </Row>
        <div style={{ width: '200px' }}>{componentWithProps}</div>
      </div>
    );
  }
}

const TestMenu = () => (
  <div>
    <div style={{ padding: '10px', border: '1px solid #ccc', display: 'flex' }}>
      <MenuTester>
        <Menu0 />
      </MenuTester>
      <MenuTester>
        <Menu1 />
      </MenuTester>
      <MenuTester>
        <Menu2 />
      </MenuTester>
      <MenuTester>
        <Menu3 />
      </MenuTester>
    </div>
  </div>
);

export default TestMenu;
/* eslint-enable */
