import { Action, Reducer } from 'redux';
import { MapState } from 'react-yandex-maps';
import OrderDetailsState from './OrderDetailsState';
import { KnownAction } from './OrderDetailsStore';

const unloadedState: OrderDetailsState = {
  bounds: [][0],
  address: "",
  formIsValid: null,
  showSpinner: true,
  formValidated: false,
  error: "",
  currentPlaceInfo: null,
  mapState: { center: [0, 0], zoom: 15 },
  crewsInfo: [],
  showOrderId: false,
  orderId: 0
};

const reducer: Reducer<OrderDetailsState> = (state: OrderDetailsState | undefined, incomingAction: Action): OrderDetailsState => {
  if (state === undefined) {
    return unloadedState;
  }

  const action = incomingAction as KnownAction;

  const getZoom = (): number => {
    if (!state.mapState || !state.mapState.zoom) {
      console.warn("state.mapState.zoom is undefined, replaced with value 15.")
      return 15;
    } else {
      return state.mapState.zoom;
    }
  }

  switch (action.type) {
    case 'REQUEST_HOUSE_BY_ADDRESS':
      return {
        ...state,
        showSpinner: true
      };
    case 'RECEIVE_HOUSE_BY_ADDRESS':
      if (action.addressFound) {
        return {
          ...state,
          showSpinner: false,
          formValidated: true,
          error: "",
          address: action.address,
          formIsValid: true,
          currentPlaceInfo: {
            addressFound: true,
            coordinates: action.coordinates
          },
          mapState: {
            center: action.coordinates,
            zoom: getZoom()
          } as MapState
        };
      };
      return {
        ...state,
        showSpinner: false,
        formValidated: true,
        error: action.error,
        formIsValid: false,
        currentPlaceInfo: null,
        crewsInfo: []
      };
    case 'RECEIVE_CURRENT_LOCATION':
      return {
        ...state,
        error: action.error !== '' ? action.error : state.error,
        showSpinner: false,
        bounds: action.boundedBy,
        mapState: {
          center: action.coordinates,
          zoom: getZoom()
        }
      }
    case 'CHANGE_ADDRESS':
      return {
        ...state,
        address: action.address,
        currentPlaceInfo: null,
        crewsInfo: [],
        formValidated: false,
        formIsValid: null,
        error: ''
      }
    case 'REQUEST_HOUSE_BY_COORDINATES':
      return {
        ...state,
        showSpinner: true,
        error: ""
      };
    case 'RECEIVE_HOUSE_BY_COORDINATES':
      return {
        ...state,
        showSpinner: false,
        currentPlaceInfo: {
          addressFound: action.addressFound,
          coordinates: action.coordinates
        },
        crewsInfo: [],
        formValidated: false,
        address: action.address,
        error: action.error
      }
    case 'RECEIVE_CREWS':
      return {
        ...state,
        error: action.error,
        crewsInfo: action.crewsInfo
      }
    case 'REQUEST_MAKE_ORDER':
      return {
        ...state,
        showSpinner: true
      }
    case 'RECEIVE_MAKE_ORDER':
      return {
        ...state,
        showSpinner: false,
        showOrderId: true,
        orderId: action.orderId,
        error: action.error
      };
    case 'CLOSE_ORDER_MESSAGE':
      return {
        ...state,
        formValidated: false,
        showOrderId: false,
        orderId: 0,
        error: '',
        address: '',
        currentPlaceInfo: null,
        crewsInfo: []
      };
  }

  return state;
};

export default reducer;