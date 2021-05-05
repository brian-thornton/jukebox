import React from 'react';
import { PropTypes } from 'prop-types';
import { Button } from 'react-bootstrap';
import { Settings } from '../shapes';
import { findPage } from '../../lib/pageHelper';

const propTypes = {
  settings: Settings.isRequired,
  setCurrentAlbum: PropTypes.func.isRequired,
};

function PagingButtons({ settings, search, pageDisabled, loadMore, loadPrevious, loadRandom, pages, page }) {
  if (!search) {
    const pageButtonProps = {
      background: settings.styles.buttonBackgroundColor,
      height: '75px',
      color: settings.styles.fontColor,
    };

    const nextDisabled = findPage(pages, page) === (pages.length - 1);
    const previousDisabled = findPage(pages, page) === 0;

    return (
      <React.Fragment>
        <Button style={{ ...pageButtonProps, marginTop: '20px' }} disabled={pageDisabled || nextDisabled} block variant="outline-light" onClick={loadMore}>Next</Button>
        <Button style={{ ...pageButtonProps, marginTop: '10px' }} disabled={pageDisabled || previousDisabled} block variant="outline-light" onClick={loadPrevious}>Previous</Button>
        {loadRandom && <Button style={{ ...pageButtonProps, marginTop: '10px' }} disabled={pageDisabled} block variant="outline-light" onClick={loadRandom}>Random</Button>}
        <div style={{ color: '#FFFFFF' }}>{pages.length ? `${pages.findIndex(p => p.start === page.start && p.limit === page.limit)} of ${pages.length}` : 'Loading...'}</div>
      </React.Fragment>
    )
  }

  return null;
}

PagingButtons.propTypes = propTypes;

export default PagingButtons;