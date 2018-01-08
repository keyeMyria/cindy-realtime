/**
 *
 * RegisterForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import environment from 'Environment';

import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { compose } from 'redux';
import { commitMutation, graphql } from 'react-relay';
import { Form, FormControl, Panel } from 'react-bootstrap';

import FieldGroup from 'components/FieldGroup';
import { setCurrentUser } from 'containers/NavbarUserDropdown/actions';
import { withModal } from 'components/withModal';

import messages from './messages';
import { registerSucceeded } from './actions';

export class RegisterForm extends React.Component {
  // eslint-disable-line react/prefer-stateless-function
  // {{{ constructor
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      nickname: '',
      password: '',
      passwordConfirm: '',
      errorMsg: null,
      username_valid: true,
      nickname_valid: true,
      password_valid: true,
      passwordConfirm_valid: true,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.confirm = this.confirm.bind(this);
  }
  // }}}
  // {{{ handleChange
  handleChange(e) {
    const target = e.target;
    if (target.id === 'formRegisterUsername') {
      this.setState({ username: target.value });
      this.setState((prevState) => ({
        username_valid:
          prevState.username.match(/^[a-zA-Z0-9@\-+._]+$/) &&
          prevState.username.length < 150 &&
          prevState.username.length > 0,
      }));
    } else if (target.id === 'formRegisterNickname') {
      this.setState({ nickname: target.value });
      this.setState((prevState) => ({
        nickname_valid:
          prevState.nickname.length < 64 && prevState.nickname.length > 0,
      }));
    } else if (target.id === 'formRegisterPassword') {
      this.setState({ password: target.value });
      this.setState((prevState) => ({
        password_valid:
          prevState.password.length < 64 &&
          prevState.password.length > 8 &&
          prevState.password.match(/[0-9]+/) &&
          prevState.password.match(/[a-zA-Z]+/),
      }));
    } else if (target.id === 'formRegisterPasswordConfirm') {
      this.setState({ passwordConfirm: target.value });
      this.setState((prevState) => ({
        passwordConfirm_valid: prevState.passwordConfirm === prevState.password,
      }));
    }
  }
  // }}}
  // {{{ handleSubmit
  handleSubmit(e) {
    e.preventDefault();
    this.confirm();
  }
  // }}}
  // {{{ confirm
  confirm() {
    const { username, nickname, password } = this.state;
    // Validation
    if (
      !this.state.username_valid ||
      !this.state.nickname_valid ||
      !this.state.password_valid ||
      !this.state.passwordConfirm_valid
    ) {
      this.setState({
        errorMsg: [{ message: 'There are some errors in your form!' }],
      });
      return;
    }
    // Commit
    commitMutation(environment, {
      mutation: RegisterFormMutation,
      variables: {
        input: { username, nickname, password },
      },
      onCompleted: (response, errors) => {
        if (errors) {
          this.setState({
            errorMsg: errors,
          });
        } else if (response) {
          const user = response.register.user;
          // TODO: Update Global User Interface here
          this.props.updateCurrentUser({
            userId: user.rowid,
            nickname: user.nickname,
          });
          this.props.dispatch(registerSucceeded());
          this.props.onHide();
        }
      },
    });
  }
  // }}}
  // {{{ render
  render() {
    return (
      <Form horizontal>
        {this.state.errorMsg
          ? this.state.errorMsg.map((e) => (
              <Panel header={e.message} bsStyle="danger" key={e.message} />
            ))
          : null}
        <FieldGroup
          id="formRegisterUsername"
          label={<FormattedMessage {...messages.usernameLabel} />}
          Ctl={FormControl}
          type="text"
          value={this.state.username}
          valid={this.state.username_valid ? null : 'error'}
          help={<FormattedMessage {...messages.usernameHelp} />}
          onChange={this.handleChange}
        />
        <FieldGroup
          id="formRegisterNickname"
          label={<FormattedMessage {...messages.nicknameLabel} />}
          Ctl={FormControl}
          type="text"
          value={this.state.nickname}
          valid={this.state.nickname_valid ? null : 'error'}
          help={<FormattedMessage {...messages.nicknameHelp} />}
          onChange={this.handleChange}
        />
        <FieldGroup
          id="formRegisterPassword"
          label={<FormattedMessage {...messages.passwordLabel} />}
          Ctl={FormControl}
          type="password"
          value={this.state.password}
          valid={this.state.password_valid ? null : 'error'}
          help={<FormattedMessage {...messages.passwordHelp} />}
          onChange={this.handleChange}
        />
        <FieldGroup
          id="formRegisterPasswordConfirm"
          label={<FormattedMessage {...messages.passwordConfirmLabel} />}
          Ctl={FormControl}
          type="password"
          value={this.state.passwordConfirm}
          valid={this.state.passwordConfirm_valid ? null : 'error'}
          onChange={this.handleChange}
        />
        <FormControl
          id="formRegiterSubmit"
          type="submit"
          onClick={this.handleSubmit}
          value={<FormattedMessage {...messages.submitLabel} />}
          className="hidden"
        />
      </Form>
    );
  }
  // }}}
}

RegisterForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  updateCurrentUser: PropTypes.func.isRequired,
  onHide: PropTypes.func,
};

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    updateCurrentUser: (user) => {
      dispatch(setCurrentUser(user));
    },
  };
}

const withConnect = connect(null, mapDispatchToProps);

export default compose(
  withConnect,
  withModal({
    header: 'Register',
    footer: {
      confirm: true,
      close: true,
    },
  })
)(RegisterForm);

const RegisterFormMutation = graphql`
  mutation RegisterFormMutation($input: UserRegisterInput!) {
    register(input: $input) {
      user {
        rowid
        nickname
      }
    }
  }
`;
