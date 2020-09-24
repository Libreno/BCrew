import { PlacemarkGeometry } from 'react-yandex-maps';

export interface IPlaceInfo {
    addressFound: boolean;
    coordinates: PlacemarkGeometry;
}
