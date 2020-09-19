import * as React from 'react';
import Container from 'react-bootstrap/Container';
import { YMaps, Map, YMapsApi } from 'react-yandex-maps';
import { connect } from 'react-redux';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { GiCityCar } from 'react-icons/gi'
import { BsGeoAlt } from 'react-icons/bs'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import LoadingOverlay from 'react-loading-overlay';
import { IState } from './IState';

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
      crewsInfo: [],
      showSpinner: true
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
    this.setState({
      showSpinner: true
    });
    // @ts-ignore: this.state.ymapsApi is not null
    this.state.ymapsApi.geocode(`${this.state.currentPlaceName}, ${address}`).then((res: any) => {
      var firstGeoObject = res.geoObjects.get(0);
      if (firstGeoObject === undefined) {
        // адрес не найден
        console.error('адрес не найден');
        return;
      };
      let coords = firstGeoObject.geometry.getCoordinates();
      this.map.setCenter(coords);
      this.loadCrews(coords, address);
      this.createPlacemark(coords);
      this.setState({
        showSpinner: false
      });
    }).catch((e: any) => {
      console.error(e);
    });
  }

  loadCrews(coords: Float32Array, address: string) {
    let request = {
      source_time: `20200916170000`, // todo
      addresses: [{
        address: address,
        lon: coords[0],
        lat: coords[1]
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
        let placemark = new component.state.ymapsApi.Placemark([crewInfo.lon, crewInfo.lat], {
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
    let component = this;
    // Определяем местоположение пользователя
    ymapsApi.geolocation.get({
      provider: 'browser',
      mapStateAutoApply: true
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
    this.setState({
      ymapsApi: ymapsApi,
      showSpinner: false
    });
  }

  onMapClick(e: any) {
    var coords = e.get('coords');
    let placemark = this.createPlacemark(coords);
    this.setState({
      showSpinner: true
    });
    this.fillAddressByCoordinates(placemark).then((address: string) => {
      this.loadCrews(coords, address);
    }).catch((e: any) => {
      console.error(e);
    }).always(() => {
      this.setState({
        showSpinner: false
      });
    })
  }

  // Создание метки.
  createPlacemark(coords: Float32Array) {
    this.map.geoObjects.removeAll();
    // @ts-ignore: this.state.ymapsApi is not null
    let placemark = new this.state.ymapsApi.Placemark(coords, {}, {
      preset: 'islands#yellowDotIcon',
    });
    this.map.geoObjects.add(placemark);
    this.setState({ currentPlacemark: placemark });
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
    });
  }

  render() {
    return (
      <LoadingOverlay className="bc-overlay"
        active={this.state.showSpinner}
        spinner
        text="Выполняется загрузка, пожалуйста, подождите..."
      >
        <Container fluid className="bc-order-details">
          <Row>
            <Col className="bc-layout-side-column"></Col>
            <Col xs={9} className="bc-layout-center-column">
              <div>
                <h4>Детали заказа</h4>
                <Form className="bc-address-form" onSubmit={this.findAddress}>
                  <Form.Control as="input" type="text" placeholder="Откуда: улица, номер дома" onChange={this.onAddressChange} value={this.state.address} />
                  <Button variant="primary" type="submit">Найти</Button>
                </Form>
              </div>
              <div className="bc-map-with-card-list">
                <YMaps query={{ apikey: '2e91d220-e2a5-4fcc-9e66-3383ab222b17', load: "package.full" }} className="bc-map">
                  <Map state={this.state.mapState}
                    modules={["geolocation", "geocode", "util.requireCenterAndZoom", "geoObject.addon.balloon", "geoObject.addon.hint"]}
                    onLoad={this.onMapLoad}
                    instanceRef={ref => (this.map = ref)}
                    width="100%"
                    height="500px" // todo: set persentage (persentage don't work for now)
                  />
                </YMaps>
                <div className="bc-crew-list">
                  {this.state.crewsInfo.map((ci) => {
                    return (
                    <div key={ci.crew_id} className="bc-crew-list-card">
                      <div className="bc-crew-icon">
                        <BsGeoAlt size="15" />
                      </div>
                      <div className="bc-crew-descr">
                        <div className="bc-car-mark-model">
                          {ci.car_mark}&nbsp;{ci.car_model}
                        </div>
                        <div>
                          {ci.car_color}
                        </div>
                      </div>
                      <div className="bc-distance">
                        {ci.distance}&nbsp;м.
                      </div>
                    </div>
                  )})}
                </div>
              </div>
              {this.state.crewsInfo[0] &&
              (<div className="bc-crew-order-bottom">
                  <div className="bc-crew-nearest">
                    <div className="bc-crew-nearest-label">
                      Подходящий экипаж:
                    </div>
                    <div className="bc-crew-card">
                      <GiCityCar size="100" />
                      <div className="bc-crew-card-car-info">
                        <div className="bc-car-mark-model">
                          {this.state.crewsInfo[0].car_mark}&nbsp;{this.state.crewsInfo[0].car_model}
                        </div>
                        <div>
                          {this.state.crewsInfo[0].car_color}
                        </div>
                        <div className="bc-car-number">
                          {this.state.crewsInfo[0].car_number}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Button variant="primary" size="lg" block type="submit">Заказать</Button>
                  </div>
              </div>
              )}
              </Col>
            <Col className="bc-layout-side-column"></Col>
          </Row>
        </Container>
      </LoadingOverlay>
    )
  }
}

export default connect()(OrderDetails);
