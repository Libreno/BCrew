import axios from 'axios';
import { AppThunkAction } from '.';

export interface RequestHouseByAddressAction { type: 'REQUEST_HOUSE_BY_ADDRESS' };
export interface ReceiveHouseByAddressAction { type: 'RECEIVE_HOUSE_BY_ADDRESS', address: string, coordinates: number[], error: string, addressFound: boolean };
export interface ReceiveFoundHouseByCoordinatesAction { type: 'RECEIVE_FOUND_HOUSE_BY_COORDINATES', address: string };
export interface ReceiveNotFoundHouseByCoordinatesAction { type: 'RECEIVE_NOT_FOUND_HOUSE_BY_COORDINATES', address: string, error: string };
export interface ReceiveCurrentLocationAction { type: 'RECEIVE_CURRENT_LOCATION', coordinates: number[], error: string, boundedBy: number[][] };
export interface ChangeAddressAction { type: 'CHANGE_ADDRESS', address: string };
export interface RequestHouseByCoordinatesAction { type: 'REQUEST_HOUSE_BY_COORDINATES' };
export interface ReceiveHouseByCoordinatesAction { type: 'RECEIVE_HOUSE_BY_COORDINATES', coordinates: number[], address: string, error: string, addressFound: boolean };
export interface ReceiveCrewsAction { type: 'RECEIVE_CREWS', crewsInfo: [], error: string };
export interface RequestMakeOrderAction { type: 'REQUEST_MAKE_ORDER' };
export interface ReceiveMakeOrderAction { type: 'RECEIVE_MAKE_ORDER', orderId: number, error: string };
export interface CloseOrderMessageAction { type: 'CLOSE_ORDER_MESSAGE' };

export type KnownAction = RequestHouseByAddressAction |
  ReceiveHouseByAddressAction |
  ReceiveFoundHouseByCoordinatesAction |
  ReceiveNotFoundHouseByCoordinatesAction |
  ReceiveCurrentLocationAction |
  ChangeAddressAction |
  RequestHouseByCoordinatesAction |
  ReceiveHouseByCoordinatesAction |
  ReceiveCrewsAction |
  RequestMakeOrderAction |
  ReceiveMakeOrderAction |
  CloseOrderMessageAction;

export const actionCreators = {
  findByAddress: (yMapsApi: any, address: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
    const appState = getState();
    if (!appState || !appState.orderDetails || !yMapsApi) {
      dispatch({ type: 'RECEIVE_HOUSE_BY_ADDRESS', address: '', error: 'No state or YMapsAPI did not initialize.', addressFound: false, coordinates: [] });
      return;
    };

    if (address === "") {
      dispatch({ type: 'RECEIVE_HOUSE_BY_ADDRESS', address: '', error: '', addressFound: false, coordinates: [] });
      return;
    }

    dispatch({ type: 'REQUEST_HOUSE_BY_ADDRESS' });
    yMapsApi.geocode(address, {
      boundedBy: appState.orderDetails.bounds,
      strictBounds: true,
      results: 1
    }).then((res: any) => {
      var firstGeoObject = res.geoObjects.get(0);
      if (firstGeoObject === undefined || firstGeoObject.properties.get('metaDataProperty.GeocoderMetaData').kind !== 'house') {
        dispatch({ type: 'RECEIVE_HOUSE_BY_ADDRESS', address: address, error: '', addressFound: false, coordinates: [] });
        return;
      };
      let shortAddress = firstGeoObject.properties.get('name');
      let coords = firstGeoObject.geometry.getCoordinates();
      dispatch({ type: 'RECEIVE_HOUSE_BY_ADDRESS', address: shortAddress, coordinates: coords, addressFound: true, error: '' });
      loadCrews(shortAddress, coords, dispatch);
    }).catch((e: any) => {
      console.error(e);
      dispatch({ type: 'RECEIVE_HOUSE_BY_ADDRESS', address: address, error: e.toString(), addressFound: false, coordinates: [] });
    });
  },

  detectCurrentLocation: (yMapsApi: any): AppThunkAction<KnownAction> => (dispatch, getState) => {
    yMapsApi.geolocation.get({
      provider: 'browser',
      mapStateAutoApply: true
    }).then(function (res: any) {
      let currentPlaceName = res.geoObjects.get(0).getLocalities();
      if (currentPlaceName === "") {
        let error = 'The current place was not detected, the component wouldn\'t work';
        dispatch({ type: 'RECEIVE_CURRENT_LOCATION', error: error, boundedBy: [][0], coordinates: [] });
        return;
      }
      let boundedBy = res.geoObjects.get(0).properties.get('boundedBy');
      dispatch({ type: 'RECEIVE_CURRENT_LOCATION', error: '', boundedBy: boundedBy, coordinates: res.geoObjects.position });
    }).catch((e: any) => {
      console.error(e);
      dispatch({ type: 'RECEIVE_CURRENT_LOCATION', error: e.toString(), boundedBy: [][0], coordinates: [] });
    });
  },

  changeAddress: (address: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
    dispatch({ type: 'CHANGE_ADDRESS', address: address });
  },

  findByCoordinates: (yMapsApi: any, coords: number[]): AppThunkAction<KnownAction> => (dispatch, getState) => {
    dispatch({ type: 'REQUEST_HOUSE_BY_COORDINATES' });
    yMapsApi.geocode(coords).then(function (res: any) {
      var firstGeoObject = res.geoObjects.get(0);
      let address = firstGeoObject.properties.get('metaDataProperty.GeocoderMetaData').kind === "house"
        ? firstGeoObject.properties.get('name')
        : "";
      if (address !== "") {
        loadCrews(address, coords, dispatch);
      };
      dispatch({ type: 'RECEIVE_HOUSE_BY_COORDINATES', address: address, addressFound: address !== '', coordinates: coords, error: '' });
    }).catch((e: any) => {
      console.error(e);
      dispatch({ type: 'RECEIVE_HOUSE_BY_COORDINATES', address: '', addressFound: false, coordinates: coords, error: e.toString() });
    });
  },

  makeOrder: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
    dispatch({ type: 'REQUEST_MAKE_ORDER' });
    const appState = getState();
    let request = {
      source_time: getDateString(),
      addresses: [{
        address: appState.orderDetails.address,
        lat: appState.orderDetails.crewsInfo[0].lat,
        lon: appState.orderDetails.crewsInfo[0].lon
      }],
      crew_id: appState.orderDetails.crewsInfo[0].crew_id
    };
    axios.post('/api/creworder/make', request).then(r => {
      dispatch({ type: 'RECEIVE_MAKE_ORDER', error: '', orderId: r.data.data.order_id });
    }).catch(e => {
      console.error(e);
      dispatch({ type: 'RECEIVE_MAKE_ORDER', error: e.toString(), orderId: 0 });
    })
  },

  closeOrderMessage: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
    dispatch({ type: 'CLOSE_ORDER_MESSAGE' });
  }
};

const loadCrews = (address: string, coords: number[], dispatch: any) => {
  let request = {
    source_time: getDateString(),
    addresses: [{
      address: address,
      lon: coords[0],
      lat: coords[1]
    }]
  };
  axios.post('/api/creworder/search', request).then(r => {
    dispatch({ type: 'RECEIVE_CREWS', crewsInfo: r.data.data.crews_info, error: '' })
  }).catch(e => {
    console.error(e);
    dispatch({ type: 'RECEIVE_CREWS', crewsInfo: [], error: e.toString() })
  })
}

const getDateString = (): string => {
  let date = new Date();
  let y = date.getFullYear();
  let m = date.getMonth() + 1;
  let d = date.getDate();
  let h = date.getHours();
  let min = date.getMinutes();
  let s = date.getSeconds();

  const format = (i: number): string => {
    return ((i < 10) ? '0' + i : i).toString();
  }

  return y.toString() + format(m) + format(d) + format(h) + format(min) + format(s);
}