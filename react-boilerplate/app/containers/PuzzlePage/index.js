/**
 *
 * PuzzlePage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import injectSaga from 'utils/injectSaga';

import { Helmet } from 'react-helmet';
import { FormattedMessage, intlShape } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Heading } from 'style-store';
import Constrained from 'components/Constrained';
import FilterableList from 'components/FilterableList';
import PuzzleList from 'components/PuzzleList';
import PuzzleActiveList from 'containers/PuzzleActiveList';
import AddPuzzleBtn from './AddPuzzleBtn';

import makeSelectPuzzlePage from './selectors';
import saga from './saga';
import messages from './messages';

function PuzzlePage(props, context) {
  const _ = context.intl.formatMessage;
  return (
    <Constrained level={4}>
      <Helmet>
        <title>{_(messages.title)}</title>
        <meta name="description" content={_(messages.description)} />
      </Helmet>
      <Heading>
        <FormattedMessage {...messages.header} />
        <span style={{ padding: '0 10px' }} />
        <AddPuzzleBtn />
      </Heading>
      <PuzzleActiveList />
      <FilterableList
        component={PuzzleList}
        variables={{ status__gt: 0 }}
        order={[{ key: 'modified', asc: false }]}
        orderList={['modified', 'starCount', 'starSum']}
      />
    </Constrained>
  );
}

PuzzlePage.contextTypes = {
  intl: intlShape,
};

PuzzlePage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  puzzlepage: makeSelectPuzzlePage(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withSaga = injectSaga({ key: 'puzzlePage', saga });

export default compose(withSaga, withConnect)(PuzzlePage);
