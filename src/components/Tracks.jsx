import { PropTypes } from 'prop-types';
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { getTracks, searchTracks } from '../lib/librarian-client';
import TrackList from './TrackList';
import { getHeight, initHorizontalPaging } from '../lib/pageHelper';
import PagedContainer from './common/PagedContainer';

const propTypes = {
  search: PropTypes.string,
  setCurrentAlbum: PropTypes.func.isRequired,
};

function Tracks({ search, setCurrentAlbum }) {
  const [paging, setPaging] = useState();
  const [tracks, setTracks] = useState([]);

  const loadTracks = (loadPage) => {
    const start = loadPage ? loadPage.start : paging ? paging.currentPage.start : 0;
    let limit = loadPage ? loadPage.limit : paging ? paging.currentPage.limit : 5;

    if (search) {
      searchTracks(search, start, limit).then((data) => {
        setTracks(data.tracks);
        if (!paging) {
          setPaging(initHorizontalPaging(data.totalTracks, 175, getHeight(), 300));
        }
      });
    } else {  
      if (start === 0) {
        limit += 1;
      }

      getTracks(start, limit).then((data) => {
        setTracks(data.tracks);

        if (!paging) {
          setPaging(initHorizontalPaging(data.totalTracks, 175, getHeight(), 300));
        }
      });
    }
  };

  useEffect(() => loadTracks(), [search]);

  const alert = () => {
    const alertText = "Loading tracks.  If you don't see any results, set up your library in Settings.";
    if (!tracks || !tracks.length) {
      return <Alert variant="primary">{alertText}</Alert>;
    }
    return <React.Fragment />;
  };

  useEffect(() => {
    if (paging) {
      loadTracks(paging.currentPage);
    }
  }, [paging]);

  const content = (
    <TrackList style={{ width: '100%', marginRight: '0px' }}
      tracks={tracks}
      showAlbumCovers
      setCurrentAlbum={setCurrentAlbum}
    />
  );

  const trackList = () => {
    if (paging && tracks.length) {
      return (
        <PagedContainer
          search={search}
          setPaging={setPaging}
          paging={paging}
          content={content}
          isHorizontal
        />
      );
    }

    return <React.Fragment />;
  };

  return (
    <>
      {alert()}
      {trackList()}
    </>
  );
}

Tracks.propTypes = propTypes;
Tracks.defaultProps = {
  search: '',
};

export default Tracks;
