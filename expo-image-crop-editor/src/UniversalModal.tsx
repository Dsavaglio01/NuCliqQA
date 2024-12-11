import React from "react";
import { Modal as RNModal, Platform } from "react-native";
//@ts-ignore
import { Modal } from "react-native-paper";
interface IUniversalModalProps extends React.ComponentProps<typeof RNModal> {
  children: React.ReactNode;
}

export const UniversalModal = (props: IUniversalModalProps) => {
  if (Platform.OS === "web") {
    return (
      <Modal visible={props.visible} style={{ margin: 0 }}>
        {props.children}
      </Modal>
    );
  }

  return <RNModal {...props} />;
};
