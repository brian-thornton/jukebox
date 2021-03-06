import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { PropTypes } from 'prop-types';

import { Album as albumShape } from './shapes';
import { coverArtUrl } from '../lib/librarian-client';
import styles from './styles';
import './TrackAlbum.css';

const propTypes = {
  album: albumShape.isRequired,
  setCurrentAlbum: PropTypes.func.isRequired,
};

function TrackAlbum({ album, setCurrentAlbum }) {
  const [coverArt, setCoverArt] = useState();

  const loadCoverArt = () => {
    coverArtUrl(album).then(data => setCoverArt(data));
  };

  useEffect(() => loadCoverArt(), []);

  if (coverArt) {
    return (
      <Card style={styles.albumCardStyleSmall} className="album-card-small" onClick={() => setCurrentAlbum(album)}>
        <Card.Img top src={coverArt} />
      </Card>
    );
  }

  return <React.Fragment />;
}

TrackAlbum.propTypes = propTypes;

export default TrackAlbum;
