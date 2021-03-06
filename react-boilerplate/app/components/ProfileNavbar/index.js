/**
 *
 * ProfileNavbar
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Flex } from 'rebass';
import { Button } from 'style-store';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

const ProfileButton = Button.extend`
  padding: 5px;
  background-color: ${(props) => props.color || 'darkgoldenrod'};
  &:hover {
    background-color: ${(props) => props.hoverColor || 'goldenrod'};
  }
`;

function ProfileNavbar(props) {
  return (
    <Flex align="center" justify="center" w={1} my={1}>
      <ProfileButton w={1} mx="3px" onClick={props.onProfileClick}>
        <FormattedMessage {...messages.profile} />
      </ProfileButton>
      <ProfileButton w={1} mx="3px" onClick={props.onPuzzlesClick}>
        <FormattedMessage {...messages.puzzles} />
      </ProfileButton>
      <ProfileButton w={1} mx="3px" onClick={props.onStarsClick}>
        <FormattedMessage {...messages.stars} />
      </ProfileButton>
      {!props.hideBookmark && (
        <ProfileButton w={1} mx="3px" onClick={props.onBookmarksClick}>
          <FormattedMessage {...messages.bookmarks} />
        </ProfileButton>
      )}
    </Flex>
  );
}

ProfileNavbar.propTypes = {
  onProfileClick: PropTypes.func.isRequired,
  onPuzzlesClick: PropTypes.func.isRequired,
  onStarsClick: PropTypes.func.isRequired,
  onBookmarksClick: PropTypes.func.isRequired,
  hideBookmark: PropTypes.bool.isRequired,
};

export default ProfileNavbar;
