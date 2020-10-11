import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import { PropTypes } from 'prop-types';
import LibrianClient from '../lib/librarian-client';
import defaultCover from '../default_album.jpg';
import styles from './styles';
import { Album as albumShape, Settings } from './shapes';

const propTypes = {
  album: albumShape.isRequired,
  cover: PropTypes.string,
  setCurrentAlbum: PropTypes.func.isRequired,
  settings: Settings.isRequired,
  coverArtOnly: PropTypes.bool,
};

function Album({
  album, cover, setCurrentAlbum, settings, coverArtOnly,
}) {
  const [coverArt, setCoverArt] = useState(defaultCover);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadCoverArt = () => {
    if (album.coverArtExists || settings.features.admin) {
      LibrianClient.getCoverArt(album.path).then((image) => {
        let src;

        if (cover) {
          src = cover;
        } else if (image.type === 'image/jpeg') {
          src = URL.createObjectURL(image);
        } else {
          src = defaultCover;
        }
        setCoverArt(src);
      });
    }
    setIsLoaded(true);
  };

  const largeAlbum = () => {
    if (coverArtOnly) {
      return (
        <Card style={styles.albumCardStyleSmall} className="h-55 w-85" onClick={() => setCurrentAlbum(album)}>
          <Card.Img style={styles.albumImageSmall} top src={coverArt} />
        </Card>
      );
    }

    return (
      <Card style={styles.albumCardStyle} className="h-55 w-85" onClick={() => setCurrentAlbum(album)}>
        <Card.Img style={styles.albumImage} top src={coverArt} />
        <Card.Body>
          <Card.Title style={styles.albumTitle}>{album.name}</Card.Title>
        </Card.Body>
      </Card>
    );
  };

  if (!isLoaded) {
    loadCoverArt();
  }

  return largeAlbum();
}

Album.propTypes = propTypes;

export default Album;
