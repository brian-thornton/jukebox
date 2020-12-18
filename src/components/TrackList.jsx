import { PropTypes } from 'prop-types';
import React, { useState } from 'react';
import {
  ListGroup, ListGroupItem, Button, Container, Row, Col,
} from 'react-bootstrap';
import QueueClient from '../lib/queue-client';
import styles from './styles';
import LibrianClient from '../lib/librarian-client';
import Album from './Album';
import { Track, Settings } from './shapes';
import { CollectionPlay, Play } from 'react-bootstrap-icons';

import './TrackList.css';

const propTypes = {
  tracks: PropTypes.arrayOf(Track),
  settings: Settings.isRequired,
  showAlbumCovers: PropTypes.bool,
  setCurrentAlbum: PropTypes.func.isRequired,
  showDownloadLink: PropTypes.bool,
};

function TrackList({ tracks, settings, showAlbumCovers, setCurrentAlbum, showDownloadLink }) {
  const [trackAlbum, setTrackAlbum] = useState();
  const [trackAlbumsLoading, setTrackAlbumsLoading] = useState();
  const [trackAlbumsLoaded, setTrackAlbumsLoaded] = useState(false);
  const [trackAlbums, setTrackAlbums] = useState([]);
  const isScreenSmall = window.innerWidth < 700;

  const playNow = (track) => {
    QueueClient.enqueueTop(track);
    QueueClient.next();
  };

  const renderTracks = [];

  const buttonProps = {
    style: styles.buttonStyle,
    variant: 'outline-light',
    className: 'float-right',
    style: { background: settings.styles.buttonBackgroundColor },
  };

  const handleDownload = (track) => {
    LibrianClient.downloadTrack(track).then((response) => {
      response.blob().then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = track.name;
        a.click();
      });
    });
  };

  const getAlbum = (track) => {
    if (trackAlbumsLoaded) {
      return trackAlbums.find(trackAlbum => trackAlbum.path === track.path.substr(0, track.path.lastIndexOf('/')));
    }
  };

  const getTrackAlbums = (tracks) => {
    setTrackAlbumsLoading(true);
    LibrianClient.getTrackAlbums(tracks).then((data) => {
      setTrackAlbums(data);
      setTrackAlbumsLoaded(true);
      setTrackAlbumsLoading(false);
    });

    return <React.Fragment />;
  };

  if (!trackAlbumsLoaded && !trackAlbumsLoading) {
    getTrackAlbums(tracks);
  }

  const link = (track) => {
    if (settings && settings.features.admin && showDownloadLink && !isScreenSmall) {
      return <div className="download"><a onClick={() => handleDownload(track)}>Download</a></div>;
    }

    return <React.Fragment />;
  };

  const album = (track) => {
    const ta = getAlbum(track);
    if (showAlbumCovers && ta) {
      if (settings && settings.features) {
        return (
          <Album
            album={ta}
            settings={settings}
            coverArtOnly
            setCurrentAlbum={setCurrentAlbum}
          />
        );
      }
    }

    return <React.Fragment />;
  };

  if (settings && settings.features) {
    tracks.forEach((track) => {
      if (track.path.split('.').pop().toLowerCase() === 'mp3') {
        let playButton;
        let enqueueButton;
        if (isScreenSmall) {
          playButton = <Button className="play-now" {...buttonProps} onClick={() => playNow(track)}><Play /></Button>;
          enqueueButton = <Button {...buttonProps} onClick={() => QueueClient.enqueue(track)}><CollectionPlay /></Button>;
        } else {
          playButton = <Button className="play-now" {...buttonProps} onClick={() => playNow(track)}>Play</Button>;
          enqueueButton = <Button {...buttonProps} onClick={() => QueueClient.enqueue(track)}>Enqueue</Button>;
        }

        if (track.id) {
          track.accessToken = window.accessToken;
        }

        if (showAlbumCovers && !isScreenSmall) {
          renderTracks.push(
            (
              <ListGroupItem style={{...styles.trackRow, color: settings.styles.fontColor}}>
                <Container style={styles.trackRow}>
                  <Row>
                    <Col lg={2} xl={2}>
                      {album(track)}
                    </Col>
                    <Col lg={10} xl={10}>
                      <div style={{ paddingTop: '10px' }}>{track.name}</div>
                      {playButton}
                      {enqueueButton}
                    </Col>
                  </Row>
                </Container>
                {link(track)}
              </ListGroupItem>
            ),
          );
        } else {
          renderTracks.push(
            (
              <ListGroupItem style={{ ...styles.cardStyle, color: settings.styles.fontColor }}>
                {track.name}
                <br />
                {playButton}
                {enqueueButton}
                {link(track)}
              </ListGroupItem>
            ),
          );
        }
      }
    });

    return <ListGroup style={{ marginTop: '15px' }}>{renderTracks}</ListGroup>;
  }

  return <React.Fragment />;
}

TrackList.propTypes = propTypes;
TrackList.defaultProps = {
  showAlbumCovers: false,
  showDownloadLink: false,
};

export default TrackList;
