import * as React from 'react';
import Container from 'react-bootstrap/Container'
import { YMaps, Map, YMapsApi, MapState } from 'react-yandex-maps';
import { connect } from 'react-redux';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

interface IState {
  address: string,
  mapState: MapState,
  ymapsApi: YMapsApi | null,
  currentPlacemark: any,
  currentPlaceName: string
}

class OrderDetails extends React.Component<{}, IState> {
  map: React.Ref<any> | any;

  constructor(props: {}) {
    super(props);
    this.state = {
      address: '',
      mapState: { center: [0, 0], zoom: 10 },
      ymapsApi: null,
      currentPlacemark: null,
      currentPlaceName: ''
    };

    this.findAddress = this.findAddress.bind(this);
    this.onAddressChange = this.onAddressChange.bind(this);
    this.onMapLoad = this.onMapLoad.bind(this);
    this.createPlacemark = this.createPlacemark.bind(this);
    this.fillAddressByCoordinates = this.fillAddressByCoordinates.bind(this);
    this.onMapClick = this.onMapClick.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.map = React.createRef();
  }

  findAddress(event: React.FormEvent<HTMLElement>) {
    event.preventDefault();
    let address = this.state.address;
    if (this.state.currentPlaceName === "") {
      console.error('Current place didn\'t detected, component would\'nt work');
      return;
    }
    // @ts-ignore: this.state.ymapsApi is not null
    this.state.ymapsApi.geocode(`${this.state.currentPlaceName}, ${address}`).then((res: any) => {
      var firstGeoObject = res.geoObjects.get(0);
      if (firstGeoObject === undefined) {
        // адрес не найден
        console.error('адрес не найден');
        return;
      }
      let coords = firstGeoObject.geometry.getCoordinates();
      //this.map.geoObjects.removeAll();
      this.createPlacemark(coords, address);
    }).catch((e: any) => {
      console.error(e);
    });
  }

  onAddressChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ address: event.target.value });
  }

  onMapLoad(ymapsApi: YMapsApi) {
    this.setState({
      ymapsApi: ymapsApi
    });
    let component = this;
    // Определяем местоположение пользователя
    ymapsApi.geolocation.get({
      provider: 'browser'
    }).then(function (res: any) {
      let currentPlaceName = res.geoObjects.get(0).getLocalities();
      component.setState({
        mapState: { center: res.geoObjects.position, zoom: 15 },
        currentPlaceName: currentPlaceName
      });
    }).catch((er: any) => {
      console.error(er)
    });

    this.map.events.add('click', this.onMapClick);
  }

  onMapClick(e: any) {
    var coords = e.get('coords');
    let placemark = this.createPlacemark(coords, 'поиск...');
    this.map.setCenter(placemark.geometry.getCoordinates());
    this.fillAddressByCoordinates(placemark);
  }

  // Создание метки.
  createPlacemark(coords: any, text: string) {
    let placemark = this.state.currentPlacemark;
    // Если метка уже создана – просто передвигаем ее.
    if (placemark) {
      this.state.currentPlacemark.geometry.setCoordinates(coords);
      placemark.properties.set({
        iconCaption: text
      });
    }
    // Если нет – создаем.
    else {
      // @ts-ignore: this.state.ymapsApi is not null
      placemark = new this.state.ymapsApi.Placemark(coords, {
        iconCaption: text
      }, {
        preset: 'islands#yellowDotIconWithCaption',
        iconColor: '#ffc300',
        draggable: true
      });
      this.map.geoObjects.add(placemark);
      // Слушаем событие окончания перетаскивания на метке.
      placemark.events.add('dragend', this.onDragEnd);
      this.setState({ currentPlacemark: placemark });
    }
    this.map.setCenter(coords);

    return placemark;
  }

  onDragEnd() {
    let placemark = this.state.currentPlacemark;
    this.fillAddressByCoordinates(placemark);
    this.map.setCenter(placemark.geometry.getCoordinates());
  }

  // Определяем адрес по координатам (обратное геокодирование).
  fillAddressByCoordinates(placemark: any) {
    let coords = placemark.geometry.getCoordinates();
    placemark.properties.set('iconCaption', 'поиск...');
    let component = this;
    // @ts-ignore: this.state.ymapsApi is not null
    this.state.ymapsApi.geocode(coords).then(function (res: any) {
      var firstGeoObject = res.geoObjects.get(0);
      // @ts-ignore: this.state.ymapsApi is not null
      let shortAddress = firstGeoObject.properties.get('name');
      placemark.properties.set({
        iconCaption: shortAddress,
        //balloonContent: firstGeoObject.getAddressLine()
      });
      component.setState({
        address: shortAddress
      });
    }).catch((e: any) => {
      console.error(e);
    });
  }

  render() {
    return (
      <Container fluid className="bc-order-details">
            <h4>Детали заказа</h4>
            <Form className="bc-address-form" onSubmit={this.findAddress}>
              <Form.Control as="input" type="text" placeholder="Откуда" onChange={this.onAddressChange} value={this.state.address} />
              <Button variant="primary" type="submit">
                Показать
              </Button>
            </Form>
            <YMaps query={{ apikey: '2e91d220-e2a5-4fcc-9e66-3383ab222b17', load: "package.full" }}>
              <div>
                <Map state={this.state.mapState}
                  modules={["geolocation", "geocode", "util.requireCenterAndZoom", "geoObject.addon.balloon", "geoObject.addon.hint"]}
                  onLoad={this.onMapLoad}
                  instanceRef={ref => (this.map = ref)}/>
              </div>
            </YMaps>
      </Container>
    )
  }
}

export default connect()(OrderDetails);
