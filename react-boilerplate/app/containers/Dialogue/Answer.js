import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { line2md, from_global_id as f, withLocale } from 'common';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { nAlert } from 'containers/Notifier/actions';
import { createStructuredSelector, createSelector } from 'reselect';
import { selectUserNavbarDomain } from 'containers/UserNavbar/selectors';

import { graphql } from 'react-apollo';
import DialoguePanel from 'graphql/DialoguePanel';
import answerMutation from 'graphql/UpdateAnswerMutation';

import tick from 'images/tick.svg';
import bulb from 'images/bulb.svg';
import cracker from 'images/cracker.svg';
import { Box, Flex } from 'rebass';
import {
  AutoResizeTextarea,
  ButtonOutline,
  EditButton,
  ImgMd,
  ImgXs,
  Switch,
  Splitter,
  DarkNicknameLink as NicknameLink,
  Time,
  PuzzleFrame,
} from 'style-store';

import { OPTIONS_SEND } from 'containers/Settings/constants';
import UserAwardPopover from 'components/UserAwardPopover';

import messages from './messages';

const StyledButton = ButtonOutline.extend`
  padding: 5px 15px;
  width: 100%;
`;

const Img = ImgMd.extend`
  padding-right: 10px;
`;

class Answer extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      content: props.answer || '',
      good: props.good,
      true: props.true,
      editMode:
        props.owner.rowid === props.user.userId && props.answer === null,
    };

    this.handleChange = (e) => this.setState({ content: e.target.value });
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.toggleGood = () => this.setState((s) => ({ good: !s.good }));
    this.toggleTrue = () => this.setState((s) => ({ true: !s.true }));
    this.toggleEditMode = (m) =>
      this.setState((s) => ({ editMode: m || !s.editMode }));
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // When a user has two windows open, escape editMode
    // if the answer is updated.
    if (
      this.props.answer !== nextProps.answer ||
      this.props.good !== nextProps.good ||
      this.props.true !== nextProps.true
    ) {
      this.setState({
        editMode:
          nextProps.owner.rowid === nextProps.user.userId &&
          nextProps.answer === null,
      });
    }
  }

  handleKeyPress(e) {
    const content = this.state.content;
    switch (this.props.sendPolicy) {
      case OPTIONS_SEND.NONE:
        break;
      case OPTIONS_SEND.ON_SHIFT_RETURN:
        if (e.nativeEvent.keyCode === 13 && e.nativeEvent.shiftKey) {
          this.handleSubmit();
        }
        break;
      case OPTIONS_SEND.ON_RETURN:
        if (e.nativeEvent.keyCode === 13 && !e.nativeEvent.shiftKey) {
          if (content[content.length - 1] === '\n') {
            this.handleSubmit();
          }
        }
        break;
      default:
    }
  }

  handleSubmit() {
    const { good, true: istrue } = this.state;
    const content = this.state.content.trimRight();
    this.setState({ content });

    if (content === '') return;
    if (
      content === this.props.answer &&
      good === this.props.good &&
      istrue === this.props.true
    ) {
      this.toggleEditMode(false);
      return;
    }

    const { id, answer } = this.props;
    const now = new Date();

    this.props
      .mutate({
        variables: {
          input: {
            dialogueId: parseInt(f(id)[1], 10),
            content,
            good,
            true: istrue,
          },
        },
        update(proxy) {
          const data = proxy.readFragment({
            id,
            fragment: DialoguePanel,
            fragmentName: 'DialoguePanel',
          });
          const nextData = {
            ...data,
            answer: content,
            good,
            true: istrue,
            answerEditTimes: answer
              ? data.answerEditTimes + 1
              : data.answerEditTimes,
            answeredtime: now.toISOString(),
          };
          proxy.writeFragment({
            id,
            fragment: DialoguePanel,
            fragmentName: 'DialoguePanel',
            data: nextData,
          });
        },
        optimisticResponse: {
          updateAnswer: {
            __typename: 'UpdateAnswerPayload',
            clientMutationId: null,
          },
        },
      })
      .then(() => {
        this.setState({ editMode: false });
      })
      .catch((error) => {
        this.props.alert(error.message);
      });
  }

  render() {
    if (this.state.editMode === true) {
      return (
        <PuzzleFrame>
          <Box w={1}>
            <FormattedMessage {...messages.answerInputHint}>
              {(msg) => (
                <AutoResizeTextarea
                  placeholder={msg}
                  value={this.state.content}
                  onChange={this.handleChange}
                  onKeyUp={this.handleKeyPress}
                  minRows={1}
                  maxRows={5}
                />
              )}
            </FormattedMessage>
            <Flex align="center" justify="center" wrap>
              <Box w={[1, 1 / 2, 5 / 12]}>
                <FormattedMessage {...messages.good} />
                <Switch checked={this.state.good} onClick={this.toggleGood} />
              </Box>
              <Box w={[1, 1 / 2, 5 / 12]}>
                <FormattedMessage {...messages.true} />
                <Switch checked={this.state.true} onClick={this.toggleTrue} />
              </Box>
              <Box w={[1, null, 1 / 6]}>
                <StyledButton onClick={this.handleSubmit}>
                  <ImgXs src={tick} />
                </StyledButton>
              </Box>
            </Flex>
          </Box>
        </PuzzleFrame>
      );
    } else if (this.props.answer !== null && this.props.answer !== '') {
      return (
        <PuzzleFrame>
          <Box width={1}>
            <NicknameLink
              to={withLocale(`/profile/show/${this.props.owner.rowid}`)}
            >
              {this.props.owner.nickname}
            </NicknameLink>
            <UserAwardPopover
              style={{ color: '#006388', fontSize: '1em' }}
              userAward={this.props.owner.currentAward}
            />
            <Time>
              {moment(this.props.answeredtime).format('YYYY-MM-DD HH:mm')}
            </Time>
          </Box>
          <Splitter />
          {this.props.good && (
            <Img style={{ padding: '5px 2px' }} src={bulb} alt="Good!" />
          )}
          {this.props.true && <Img src={cracker} alt="Congratulations!" />}
          <span
            style={{
              fontSize:
                (this.props.true && '1.3em') ||
                (this.props.good && '1.15em') ||
                '1em',
              overflow: 'auto',
            }}
            dangerouslySetInnerHTML={{ __html: line2md(this.props.answer) }}
          />
          {this.props.answerEditTimes > 0 && (
            <Time>
              <FormattedMessage
                {...messages.edited}
                values={{ times: this.props.answerEditTimes }}
              />
            </Time>
          )}
          {this.props.owner.rowid === this.props.user.userId &&
            this.props.status === 0 && (
              <FormattedMessage {...messages.edit}>
                {(msg) => (
                  <EditButton onClick={() => this.toggleEditMode(true)}>
                    {msg}
                  </EditButton>
                )}
              </FormattedMessage>
            )}
        </PuzzleFrame>
      );
    }
    return (
      <PuzzleFrame>
        <FormattedMessage {...messages.waiting} />
      </PuzzleFrame>
    );
  }
}

Answer.propTypes = {
  mutate: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  good: PropTypes.bool.isRequired,
  true: PropTypes.bool.isRequired,
  answer: PropTypes.string,
  answeredtime: PropTypes.string,
  answerEditTimes: PropTypes.number.isRequired,
  owner: PropTypes.object.isRequired,
  user: PropTypes.object,
  status: PropTypes.number.isRequired,
  sendPolicy: PropTypes.string.isRequired,
  alert: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  user: createSelector(selectUserNavbarDomain, (substate) =>
    substate.get('user').toJS()
  ),
});

const mapDispatchToProps = (dispatch) => ({
  alert: (message) => dispatch(nAlert(message)),
});

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withMutation = graphql(answerMutation);

export default compose(withConnect, withMutation)(Answer);
