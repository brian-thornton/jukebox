import React from 'react';
import { Card } from 'react-bootstrap';
import { PropTypes } from 'prop-types';
import LibrianClient from '../lib/librarian-client';
import defaultCover from '../default_album.jpg';
import styles from './styles';

class Album extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      coverArt: defaultCover,
    };
    if (props.album.coverArtExists) {
      LibrianClient.getCoverArt(props.album.path).then((image) => {
        const that = this;
        let src;

        if (props.coverArt) {
          src = props.coverArt;
        } else if (image.type === 'image/jpeg') {
          src = URL.createObjectURL(image);
        } else {
          src = defaultCover;
        }

        that.setState({
          coverArt: src,
        });
        that.forceUpdate();
      });
    }

    this.pageSize = 100;
    this.currentPage = 1;
  }

  largeAlbum() {
    const { album, setCurrentAlbum } = this.props;
    const { coverArt } = this.state;

    return (
      <Card style={styles.albumCardStyle} className="h-55 w-85" onClick={() => setCurrentAlbum(album)}>
        <Card.Img style={styles.albumImage} top src={coverArt} />
        <Card.Body>
          <Card.Title style={styles.albumTitle}>{album.name}</Card.Title>
        </Card.Body>
      </Card>
    );
  }

  render() {
    return this.largeAlbum();
  }
}
export default Album;

Album.propTypes = {
  setCurrentAlbum: PropTypes.func.isRequired,
  album: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,
};
