import * as React from 'react';
import Container from 'react-bootstrap/Container';
import { YMaps, Map, YMapsApi, MapState } from 'react-yandex-maps';
import { connect } from 'react-redux';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

interface IState {
  address: string,
  mapState: MapState,
  ymapsApi: YMapsApi | null,
  currentPlacemark: any,
  currentPlaceName: string,
  crewsInfo: Array<any>
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
      currentPlaceName: '',
      crewsInfo: []
    };

    this.findAddress = this.findAddress.bind(this);
    this.onAddressChange = this.onAddressChange.bind(this);
    this.onMapLoad = this.onMapLoad.bind(this);
    this.createPlacemark = this.createPlacemark.bind(this);
    this.fillAddressByCoordinates = this.fillAddressByCoordinates.bind(this);
    this.onMapClick = this.onMapClick.bind(this);
    this.loadCrews = this.loadCrews.bind(this);
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
      };
      let coords = firstGeoObject.geometry.getCoordinates();
      this.loadCrews(coords, address);
      this.createPlacemark(coords);
    }).catch((e: any) => {
      console.error(e);
    });
  }

  loadCrews(coords: Float32Array, address: string) {
    let request = {
      source_time: `20200916170000`, // todo
      addresses: [{
        address: address,
        lat: coords[0],
        lon: coords[1]
      }]
    };
    let component = this;
    return axios.post('/api/creworder/search', request).then(r => {
      if (r.data.code !== 0) {
        console.error(r.data.descr);
        console.error(r);
      };
      component.setState({
        crewsInfo: r.data.data.crews_info
      });
      r.data.data.crews_info.forEach((crewInfo: any) => {
        // @ts-ignore: this.state.ymapsApi is not null
        let placemark = new component.state.ymapsApi.Placemark([crewInfo.lat, crewInfo.lon], {
        }, {
          preset: 'islands#greenAutoIcon',
        });
        this.map.geoObjects.add(placemark);
      })
    }).catch(e => {
      console.error(e);
    })
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
    let placemark = this.createPlacemark(coords);
    this.fillAddressByCoordinates(placemark).then((address: string) => {
      this.loadCrews(coords, address);
    }).catch((e: any) => {
      console.error(e);
    });
  }

  // Создание метки.
  createPlacemark(coords: Float32Array) {
    let placemark = this.state.currentPlacemark;
    // Если метка уже создана – просто передвигаем ее.
    if (placemark) {
      this.state.currentPlacemark.geometry.setCoordinates(coords);
    }
    // Если нет – создаем.
    else {
      // @ts-ignore: this.state.ymapsApi is not null
      placemark = new this.state.ymapsApi.Placemark(coords, {}, {
        preset: 'islands#yellowDotIcon',
      });
      this.map.geoObjects.add(placemark);
      // Слушаем событие окончания перетаскивания на метке.
      this.setState({ currentPlacemark: placemark });
    }

    return placemark;
  }

  // Определяем адрес по координатам (обратное геокодирование).
  fillAddressByCoordinates(placemark: any) {
    let coords = placemark.geometry.getCoordinates();
    let component = this;
    // @ts-ignore: this.state.ymapsApi is not null
    return this.state.ymapsApi.geocode(coords).then(function (res: any) {
      var firstGeoObject = res.geoObjects.get(0);
      // @ts-ignore: this.state.ymapsApi is not null
      let shortAddress = firstGeoObject.properties.get('name');
      component.setState({
        address: shortAddress
      });
      return shortAddress;
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
