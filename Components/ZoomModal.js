import React from 'react';
import { Modal, Image } from 'react-native';
import ZoomViewer from 'react-native-image-zoom-viewer';

const ZoomModal = ({ sourceUri, visible, onClose }) => (
  <Modal visible={visible} transparent={true}>
    <ZoomViewer onCancel={onClose}>
      <Image source={{ uri: sourceUri }} style={{ width: '100%', height: '100%' }} />
    </ZoomViewer>
  </Modal>
);

export default ZoomModal;
