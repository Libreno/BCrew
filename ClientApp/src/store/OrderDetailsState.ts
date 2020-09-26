import { MapState, PlacemarkGeometry } from 'react-yandex-maps';
import ICrewInfo from './ICrewInfo';

export default interface OrderDetailsState {
  address: string;
  bounds: number[][];
  showSpinner: boolean;
  formValidated: boolean;
  formIsValid: boolean | null;
  error: string;
  currentPlaceInfo: {
    addressFound: boolean;
    coordinates: PlacemarkGeometry;
  } | null;
  mapState: MapState;
  crewsInfo: ICrewInfo[];
  showOrderId: boolean;
  orderId: number;
}
