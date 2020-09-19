import { YMapsApi, MapState } from 'react-yandex-maps';
export interface IState {
    address: string;
    mapState: MapState;
    ymapsApi: YMapsApi | null;
    currentPlacemark: any;
    currentPlaceName: string;
    crewsInfo: Array<any>;
    showSpinner: boolean;
}
