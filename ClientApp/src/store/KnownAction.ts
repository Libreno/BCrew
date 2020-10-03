export interface RequestHouseByAddressAction {
  type: 'REQUEST_HOUSE_BY_ADDRESS'
};

export interface ReceiveHouseByAddressAction {
  type: 'RECEIVE_HOUSE_BY_ADDRESS', 
  address: string,
  coordinates: number[],
  error: string,
  addressFound: boolean
};

export interface ReceiveFoundHouseByCoordinatesAction {
  type: 'RECEIVE_FOUND_HOUSE_BY_COORDINATES', 
  address: string
};

export interface ReceiveNotFoundHouseByCoordinatesAction {
  type: 'RECEIVE_NOT_FOUND_HOUSE_BY_COORDINATES', 
  address: string,
  error: string
};

export interface ReceiveCurrentLocationAction {
  type: 'RECEIVE_CURRENT_LOCATION', 
  coordinates: number[],
  error: string,
  boundedBy: number[][]
};

export interface ChangeAddressAction {
  type: 'CHANGE_ADDRESS', 
  address: string
};

export interface RequestHouseByCoordinatesAction {
  type: 'REQUEST_HOUSE_BY_COORDINATES'
};

export interface ReceiveHouseByCoordinatesAction {
  type: 'RECEIVE_HOUSE_BY_COORDINATES', 
  coordinates: number[],
  address: string,
  error: string,
  addressFound: boolean
};

export interface ReceiveCrewsAction {
  type: 'RECEIVE_CREWS',
  crewsInfo: [],
  error: string
};

export interface RequestMakeOrderAction {
  type: 'REQUEST_MAKE_ORDER'
};

export interface ReceiveMakeOrderAction {
  type: 'RECEIVE_MAKE_ORDER',
  orderId: number,
  error: string
};

export interface CloseOrderMessageAction {
  type: 'CLOSE_ORDER_MESSAGE'
};

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
