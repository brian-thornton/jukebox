import React from 'react';
import {
  Button,
  Modal,
  InputGroup,
  FormControl,
} from 'react-bootstrap';
import { PropTypes } from 'prop-types';

import { Settings } from '../shapes';
import {
  buttonProps,
  modalBodyStyle,
  modalFooterStyle,
  modalHeaderStyle,
  modalTitleStyle,
} from '../../lib/styleHelper';

const propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleSave: PropTypes.func.isRequired,
  handleHide: PropTypes.func.isRequired,
  settings: Settings.isRequired,
};

function LibraryDiscoverModal({
  isOpen,
  handleHide,
  handleSave,
  settings,
}) {
  return (
    <Modal show={isOpen} onHide={handleHide}>
      <Modal.Header style={modalHeaderStyle(settings)} closeButton>
        <Modal.Title style={modalTitleStyle(settings)}>Discover</Modal.Title>
      </Modal.Header>
      <Modal.Body style={modalBodyStyle(settings)}>
        <InputGroup className="mb-3">
          <FormControl
            id="path"
            placeholder="Path"
            aria-label="Path"
            aria-describedby="basic-addon1"
          />
        </InputGroup>
      </Modal.Body>
      <Modal.Footer style={modalFooterStyle(settings)}>
        <Button {...buttonProps(settings)} onClick={handleHide}>Close</Button>
        <Button {...buttonProps(settings)} onClick={handleSave}>Discover</Button>
      </Modal.Footer>
    </Modal>
  );
}

LibraryDiscoverModal.propTypes = propTypes;

export default LibraryDiscoverModal;
