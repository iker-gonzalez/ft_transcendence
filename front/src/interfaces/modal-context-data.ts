import { Dispatch, SetStateAction } from 'react';

export default interface ModalContextData {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}
