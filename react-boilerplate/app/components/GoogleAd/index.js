/*
*
* GoogleAd
*
*/

import React from 'react';
import PropTypes from 'prop-types';
// import styled from 'styled-components';

import { googleAdClientToken } from 'settings';

class GoogleAd extends React.PureComponent {
  componentDidMount() {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }
  render() {
    const optionalAttr = {
      'data-ad-layout-key': this.props.layoutKey,
    };
    return (
      <div style={this.props.wrapperDivStyle}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          {...optionalAttr}
          data-ad-client={this.props.client}
          data-ad-slot={this.props.slot}
          data-ad-format={this.props.format}
        />
      </div>
    );
  }
}

GoogleAd.propTypes = {
  client: PropTypes.string.isRequired,
  slot: PropTypes.string.isRequired,
  format: PropTypes.string.isRequired,
  wrapperDivStyle: PropTypes.object,
  layoutKey: PropTypes.string,
};

GoogleAd.defaultProps = {
  wrapperDivStyle: {
    overflow: 'hidden',
  },
};

const RegisterGoogleAd = (Wrapped) => (props) =>
  googleAdClientToken && <Wrapped client={googleAdClientToken} {...props} />;

export default RegisterGoogleAd(GoogleAd);
