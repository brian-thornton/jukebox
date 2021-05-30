import React, { useState } from 'react';
import { PropTypes } from 'prop-types';
import {
  ListGroup, ListGroupItem, Button,
} from 'react-bootstrap';
import { enqueueTracks, enqueueTracksTop, play } from '../../lib/queue-client';
import {
  getPlaylist,
  deletePlaylist,
  add,
  removeTracksFromPlaylist,
} from '../../lib/playlist-client';
import ContentWithControls from '../common/ContentWithControls';
import PlaylistAddModal from './PlaylistAddModal';
import PlaylistDeleteModal from './PlaylistDeleteModal';
import styles from '../styles';
import { Settings } from '../shapes';
import { buttonProps, controlButtonProps } from '../../lib/styleHelper';
import PlayNowButton from '../PlayNowButton';
import EnqueueButton from '../EnqueueButton';
import { getHeight, nextPage, previousPage, initializePaging } from '../../lib/pageHelper';

const propTypes = {
  handleBackToPlaylists: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  settings: Settings.isRequired,
};

function PlaylistDetail({ name, handleBackToPlaylists, settings }) {
  const [tracks, setTracks] = useState([]);
  const [isEmpty, setIsEmpty] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSaveAsOpen, setIsSaveAsOpen] = useState(false);
  const controlProps = controlButtonProps(settings);
  const [paging, setPaging] = useState();
  const [initialHeight, setInitialHeight] = useState(getHeight());
  const { fontColor, trackBackgroundColor } = settings.styles;
  const renderTracks = [];

  const loadTracks = (name) => {
    getPlaylist(name).then((playlist) => {
      if (!playlist.tracks.length) {
        setIsEmpty(true);
      } else {
        setTracks(playlist.tracks);
        setPaging(initializePaging(playlist.tracks.length, 100, initialHeight));
      }
    });
  };

  const runPlaylist = () => {
    enqueueTracksTop(tracks);
    play();
  };

  const enqueuePlaylist = () => {
    enqueueTracks(tracks);
  };

  const shuffle = () => {
    deletePlaylist(name).then(() => {
      const newOrder = tracks.sort(() => Math.random() - 0.5);

      add({
        name,
        tracks: newOrder,
      }).then(() => loadTracks(name));
    });
  };

  const handleSave = (data) => {
    if ((typeof data) === 'string') {
      add({
        name: data,
        tracks,
      });
    }
    setIsSaveAsOpen(false);
    handleBackToPlaylists();
  };

  const deleteTrack = (name, track) => {
    removeTracksFromPlaylist(name, [track]);
    loadTracks(name);
  };

  if (!isEmpty && !tracks.length) {
    loadTracks(name);
  }

  if (tracks) {
    tracks.forEach((track) => {
      renderTracks.push(
        (
          <ListGroupItem
            style={{
              ...styles.cardStyle,
              color: fontColor,
              background: trackBackgroundColor,
            }}
          >
            {track.name}
            <PlayNowButton track={track} settings={settings} />
            <EnqueueButton track={track} settings={settings} />
            <Button
              {...buttonProps(settings)}
              onClick={() => deleteTrack(name, track)}
            >
              Delete
            </Button>
          </ListGroupItem>
        ),
      );
    });
  }

  const handleDelete = () => {
    setShowDeleteModal(true);
    deletePlaylist(name).then(() => {
      handleBackToPlaylists();
    });
  };

  const controls = () => (
    <React.Fragment>
      <Button {...controlProps} onClick={handleBackToPlaylists}>Back to Playlists</Button>
      <Button {...controlProps} onClick={runPlaylist}>Run Playlist</Button>
      <Button {...controlProps} onClick={enqueuePlaylist}>Enqueue Playlist</Button>
      <Button {...controlProps} onClick={shuffle}>Shuffle Playlist</Button>
      <Button {...controlProps} onClick={() => setIsSaveAsOpen(true)}>Save As...</Button>
      <Button {...controlProps} onClick={() => setShowDeleteModal(true)}>Delete Playlist</Button>
    </React.Fragment>
  );

  const content = () => (
    <ListGroup>
      {renderTracks}
    </ListGroup>
  );

  return (
    <React.Fragment>
      <ContentWithControls
        alertText={`Playlist: ${name}`}
        controls={controls()}
        content={content()}
      />
      <PlaylistAddModal
        isOpen={isSaveAsOpen}
        handleClose={() => setIsSaveAsOpen(false)}
        handleSave={handleSave}
        existingPlaylistName={name}
        settings={settings}
      />
      <PlaylistDeleteModal
        isOpen={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        handleDelete={handleDelete}
      />
    </React.Fragment>
  );
}

PlaylistDetail.propTypes = propTypes;

export default PlaylistDetail;
