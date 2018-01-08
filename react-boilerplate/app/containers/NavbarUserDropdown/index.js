/**
 *
 * NavbarUserDropdown
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import { MenuItem, Nav, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import LoginMenuItem from 'containers/LoginMenuItem';
import LogoutMenuItem from 'containers/LogoutMenuItem';
import RegisterMenuItem from 'containers/RegisterMenuItem';

import injectReducer from 'utils/injectReducer';
import injectSaga from 'utils/injectSaga';
import makeSelectNavbarUserDropdown from './selectors';
import reducer from './reducer';
import saga from './saga';
import messages from './messages';

import { connectViewer, disconnectViewer } from './actions';

export class NavbarUserDropdown extends React.Component {
  // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = { hover: false };
  }

  componentDidMount() {
    this.props.dispatch(connectViewer());
  }

  componentWillUnmount() {
    this.props.dispatch(disconnectViewer());
  }

  render() {
    const loggedInTitle = (
      <FormattedMessage
        {...messages.loggedInTitle}
        values={{ nickname: this.props.navbaruserdropdown.user.nickname }}
      />
    );
    const notLoggedInTitle = <FormattedMessage {...messages.guestTitle} />;
    const onlineViewerNumTitle = (
      <FormattedMessage
        {...messages.onlineUsers}
        values={{
          userCount: this.props.navbaruserdropdown.onlineViewerCount,
        }}
      />
    );
    return (
      <Nav pullRight>
        {this.props.navbaruserdropdown.user.userId ? (
          <NavDropdown
            eventKey={0}
            title={this.state.hover ? onlineViewerNumTitle : loggedInTitle}
            id="mainnavbar-user-dropdown"
            onMouseEnter={() => this.setState({ hover: true })}
            onMouseLeave={() => this.setState({ hover: false })}
          >
            <LinkContainer
              to={`/profile/${this.props.navbaruserdropdown.user.userId}`}
            >
              <MenuItem eventKey={0.3}>{gettext('My Profile')}</MenuItem>
            </LinkContainer>
            <LinkContainer to="/logout">
              <LogoutMenuItem eventKey={0.4}>
                {gettext('Logout')}
              </LogoutMenuItem>
            </LinkContainer>
          </NavDropdown>
        ) : (
          <NavDropdown
            eventKey={0}
            title={this.state.hover ? onlineViewerNumTitle : notLoggedInTitle}
            id="mainnavbar-user-dropdown"
            onMouseEnter={() => this.setState({ hover: true })}
            onMouseLeave={() => this.setState({ hover: false })}
          >
            <LoginMenuItem eventKey={0.1}>{gettext('Login')}</LoginMenuItem>
            <RegisterMenuItem eventKey={0.2}>
              {gettext('Register')}
            </RegisterMenuItem>
          </NavDropdown>
        )}
      </Nav>
    );
  }
}

NavbarUserDropdown.propTypes = {
  dispatch: PropTypes.func.isRequired,
  navbaruserdropdown: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  navbaruserdropdown: makeSelectNavbarUserDropdown(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'navbarUserDropdown', reducer });
const withSaga = injectSaga({ key: 'navbarUserDropdown', saga });

export default compose(withReducer, withSaga, withConnect)(NavbarUserDropdown);
