import * as React from 'react';
import axios from 'axios';
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row'
import { BsGeoAlt } from 'react-icons/bs'
import { GiCityCar } from 'react-icons/gi'
import LoadingOverlay from 'react-loading-overlay';
import { connect } from 'react-redux';
import { YMaps, Map, YMapsApi } from 'react-yandex-maps';
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
      showSpinner: true,
      error: '',
      orderId: null,
      showOrderId: false
    };

    this.findAddress = this.findAddress.bind(this);
    this.onAddressChange = this.onAddressChange.bind(this);
    this.onMapLoad = this.onMapLoad.bind(this);
    this.createPlacemark = this.createPlacemark.bind(this);
    this.fillAddressByCoordinates = this.fillAddressByCoordinates.bind(this);
    this.onMapClick = this.onMapClick.bind(this);
    this.loadCrews = this.loadCrews.bind(this);
    this.makeOrder = this.makeOrder.bind(this);

    this.map = React.createRef();
  }

  findAddress(event: React.FormEvent<HTMLElement>) {
    event.preventDefault();
    this.setState({
      error: ''
    });
    let address = this.state.address;
    if (this.state.currentPlaceName === "") {
      let error = 'The current place was not detected, the component wouldn\'t work';
      console.error(error);
      this.setState({
        error: error
      });
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
        let error = 'адрес не найден';
        console.error(error);
        this.setState({
          error: error
        });
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
      this.setState({
        error: e.toString()
      });
    });
  }

  loadCrews(coords: Float32Array, address: string) {
    let request = {
      source_time: `20200916170000`, // value not used
      addresses: [{
        address: address,
        lon: coords[0],
        lat: coords[1]
      }]
    };
    let component = this;
    return axios.post('/api/creworder/search', request).then(r => {
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
      component.setState({
        error: e.toString()
      });
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
      component.setState({
        error: er.toString()
      });
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
      showSpinner: true,
      error: ''
    });
    this.fillAddressByCoordinates(placemark).then((address: string) => {
      this.loadCrews(coords, address);
    }).catch((e: any) => {
      console.error(e);
      this.setState({
        error: e.toString()
      });
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

  makeOrder() {
    let request = {
      source_time: '20200921100955', // value not used
      addresses: [{
        address: this.state.address,
        lat: this.state.crewsInfo[0].lon,
        lon: this.state.crewsInfo[0].lon
      }],
      crew_id: this.state.crewsInfo[0].crew_id
    };
    axios.post('/api/creworder/make', request).then(r => {
      this.setState({
        showOrderId: true,
        orderId: r.data.order_id
      });
    }).catch(e => {
      console.error(e);
      this.setState({
        error: e.toString()
      });
    })
  }

  orderMore() {
    this.setState({
      showOrderId: false
    });
  }

  render() {
    return (
      <LoadingOverlay className="bc-overlay"
        active={this.state.showSpinner}
        spinner
        text="Выполняется загрузка, пожалуйста, подождите..."
      >
        {this.state.showOrderId &&
          <div>
          <Alert variant="info">Заказ номер {this.state.orderId} принят.</Alert>
          <Button variant="primary" onClick={this.orderMore}>Заказать ещё</Button>
          </div>
        }{!this.state.showOrderId &&
          <Container fluid className="bc-order-details">
            <Row>
              <Col className="bc-layout-side-column"></Col>
              <Col xs={9} className="bc-layout-center-column">
                <div>
                  <h4>Детали заказа</h4>
                  {(this.state.error !== '') &&
                    <Alert variant="danger">{this.state.error}</Alert>
                  }
                  <Form className="bc-address-form" onSubmit={this.findAddress}>
                    <Form.Control as="input" type="text" placeholder="Откуда: улица, номер дома" onChange={this.onAddressChange} value={this.state.address} required />
                    <Form.Control.Feedback type="invalid">
                      Поле обязательно для заполнения.
                  </Form.Control.Feedback>
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
                      )
                    })}
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
                      <Button variant="primary" size="lg" block onClick={this.makeOrder}>Заказать</Button>
                    </div>
                  </div>
                  )}
              </Col>
              <Col className="bc-layout-side-column"></Col>
            </Row>
          </Container>}
      </LoadingOverlay>
    )
  }
}

export default connect()(OrderDetails);
