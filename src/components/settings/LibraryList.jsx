import React, { useState } from 'react';
import {
  ListGroup, ListGroupItem, Button, Col, Row, Container,
} from 'react-bootstrap';
import {
  Check,
  CloudDownload,
  Search,
  Trash,
  X,
} from 'react-bootstrap-icons';
import StatusClient from '../../lib/status-client';

import LibrarianClient from '../../lib/librarian-client';
import LibraryAddModal from './LibraryAddModal';
import LibraryDiscoverModal from './LibraryDiscoverModal';
import styles from '../styles';

const albumArt = require('album-art');

function LibraryList({settings}) {
  const [libraries, setLibraries] = useState([]);
  const [show, setShow] = useState(false);
  const [showDiscover, setShowDiscover] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleClose = (path) => {
    if (path) {
      LibrarianClient.add({
        path,
      });
    }
    setShow(false);
  };

  const loadLibraries = () => {
    setIsLoading(true);
    LibrarianClient.getLibraries().then((data) => {
      setLibraries(data);
      setIsLoading(false);
      setIsLoaded(true);
      updateTotals(data);
    });
  };

  const updateTotals = (data) => {
    let totalTracks = 0;
    let totalAlbums = 0;
    data.forEach(lib => {
      totalTracks += lib.totalTracks;
      totalAlbums += lib.albums.length;
    });
    StatusClient.getStatus().then((data) => {
      StatusClient.updateStatus({ ...data, totalTracks: totalTracks, totalAlbums: totalAlbums });
    });
  }

  const handleCloseDiscover = (path) => {
    if (path) {
      LibrarianClient.discover(path).then((libs) => {
        libs.forEach(lib => {
          if (!libraries.find((l) => l.path === lib)) {
            LibrarianClient.add({ path: lib });
          }
        });
        loadLibraries();
      });
    }
    setShowDiscover(false);
  };

  const handleShow = () => setShow(true);
  const handleDiscover = () => setShowDiscover(true);

  const deleteLibrary = (name) => {
    LibrarianClient.delete(name).then(() => {
      LibrarianClient.getLibraries().then((data) => {
        setLibraries(data);
      });
    });
  };

  const onScan = (library) => {
    setIsScanning(true);
    LibrarianClient.scan(library).then(() => {
      setIsScanning(false);
      loadLibraries();
    });
  };

  const downloadCoverArt = (library) => {
    let count = 0;
    library.albums.forEach((album) => {
      if (!album.coverArtExists) {
        const nameArray = album.name.split('-');
        setTimeout(() => {
          albumArt(nameArray[0], { album: nameArray[1] }).then((data) => {
            if (data.toString().includes('http')) {
              LibrarianClient.saveCoverArt({ album, url: data });
            }
          });
        }, 2000 * count);
        count += 1;
      }
    });
  };

  if (!isLoaded && !isLoading && !libraries.length) {
    loadLibraries();
  }

  const renderLibraries = [];

  const buttonProps = {
    style: styles.buttonStyle,
    variant: 'outline-light',
    className: 'float-right',
  };

  if (isScanning) {
    buttonProps.disabled = true;
  }

  let totalTracks = 0;
  libraries.forEach((library) => {
    const enabled = library.enabled ? <Check /> : <X />;
    const style = library.enabled ? styles.enabledStyle : styles.disabledStyle;
    if (library.totalTracks) {
      totalTracks += library.totalTracks;
    }

    renderLibraries.push(
      (
        <ListGroupItem style={styles.cardStyle} key={library.path}>
          {`${library.path} - Tracks: ${library.totalTracks || 0}`}
          <Button
            {...buttonProps}
            onClick={() => onScan({
              name: library.name,
              path: library.path,
              enabled: library.enabled,
            })}
          >
            <Search />
          </Button>
          <Button {...buttonProps} onClick={() => deleteLibrary(library.name)}><Trash /></Button>
          <Button {...buttonProps} variant="outline-light" className="float-right" disabled={isScanning} onClick={() => downloadCoverArt(library)}>
            <CloudDownload />
          </Button>
          <Button style={style} variant="outline-light" className="float-right" disabled={isScanning}>{enabled}</Button>
        </ListGroupItem>
      ),
    );
  });

  return (
    <>
      <Container style={{ marginTop: '0px' }}>
        <Row>
          <Col lg={12} xl={12}>
            <div style={styles.totalTracksStyle}>
              Total Library Tracks:
              <div style={styles.totalTracksCount}>{totalTracks}</div>
            </div>
            <Button
              variant="outline-light"
              className="float-right"
              onClick={handleShow}
            >
              Add
            </Button>
            <Button
              style={{ marginRight: '8px' }}
              variant="outline-light"
              className="float-right"
              onClick={handleDiscover}
            >
              Discover
            </Button>
          </Col>
        </Row>
        <Row style={{ marginTop: '5px' }}>
          <Col lg={12} xl={12}>
            <ListGroup>
              {renderLibraries}
            </ListGroup>
          </Col>
        </Row>
      </Container>
      <LibraryAddModal settings={settings} isOpen={show} handleHide={() => setShow(false)} handleSave={() => handleClose(document.getElementById('path').value)} />
      <LibraryDiscoverModal settings={settings} isOpen={showDiscover} handleHide={() => setShowDiscover(false)} handleSave={() => handleCloseDiscover(document.getElementById('path').value)} />
    </>
  );
}
export default LibraryList;
