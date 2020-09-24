import { YMapsApi, MapState } from 'react-yandex-maps';
import { ICrewInfo } from './ICrewInfo';
import { IPlaceInfo } from './IPlaceInfo';

export interface IState {
  address: string;
  mapState: MapState;
  bounds: number[][];
  ymapsApi: YMapsApi | null;
  currentPlaceInfo: IPlaceInfo | null;
  crewsInfo: Array<ICrewInfo>;
  showSpinner: boolean;
  error: string,
  orderId: number | null,
  showOrderId: boolean,
  formValidated: boolean
}