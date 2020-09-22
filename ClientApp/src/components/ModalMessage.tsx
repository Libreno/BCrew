﻿import * as React from 'react';
import { connect } from 'react-redux';
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button';

const ModalMessage = ({ show, orderId, onHide }: any) => (
  <Modal
    show={show}
    size="sm"
    aria-labelledby="bc-modal"
    centered
    className="bc-modal"
  >
    <Modal.Body>
      Заказ номер {orderId} принят.
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={onHide}>Закрыть</Button>
    </Modal.Footer>
  </Modal>
);

export default connect()(ModalMessage);