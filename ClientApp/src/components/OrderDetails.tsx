import * as React from 'react';
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
import { YMaps, Map, YMapsApi, Placemark } from 'react-yandex-maps';
import ModalMessage from './ModalMessage';
import * as OrderDetailsStore from '../store/OrderDetailsStore';
import OrderDetailsState from "../store/OrderDetailsState";
import { ApplicationState } from '../store';

type OrderDetailsProps = OrderDetailsState & typeof OrderDetailsStore.actionCreators;

class OrderDetails extends React.PureComponent<OrderDetailsProps> {
  addressInput: React.Ref<any> | any;
  yMapsAPI: any;

  constructor(props: OrderDetailsProps) {
    super(props);

    this.findAddress = this.findAddress.bind(this);
    this.onMapLoad = this.onMapLoad.bind(this);
    this.onMapClick = this.onMapClick.bind(this);

    this.addressInput = React.createRef();
  }

  findAddress(event: React.FormEvent<any>) {
    event.preventDefault();
    this.props.findByAddress(this.yMapsAPI, this.props.address);
  }

  onMapLoad(ymapsApi: YMapsApi) {
    this.yMapsAPI = ymapsApi;
    this.props.detectCurrentLocation(this.yMapsAPI);
  }

  componentDidUpdate() {
    if (this.props.formValidated) {
      this.addressInput.setCustomValidity(this.props.formIsValid? '' : "error");
    }
  }

  onMapClick(e: any) {
    var coords = e.get('coords');
    this.props.findByCoordinates(this.yMapsAPI, coords);
  }

  render() {
    return (
      <LoadingOverlay className="bc-overlay"
        active={this.props.showSpinner}
        spinner
        text="Выполняется загрузка, пожалуйста, подождите..."
      >
        <Container fluid className="bc-order-details">
          <Row>
            <Col className="bc-layout-side-column"></Col>
            <Col xs={9} className="bc-layout-center-column">
              <div>
                <h4>Детали заказа</h4>
                {(this.props.error !== '') &&
                  <Alert variant="danger">{this.props.error}</Alert>
                }
                <Form noValidate
                  className="bc-address-form"
                  onSubmit={this.findAddress}
                  validated={this.props.formValidated}
                >
                  <Form.Row>
                    <Col sm={1}>
                      <Form.Label>Откуда:</Form.Label>
                    </Col>
                    <Col sm={10}>
                      <Form.Group>
                      <Form.Control as="input"
                        type="text"
                        placeholder="улица, номер дома"
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.props.changeAddress(event.target.value)}
                        value={this.props.address}
                        required
                        ref={(ref: any) => { this.addressInput = ref; }}
                        />
                      <Form.Control.Feedback type="invalid" className="bc-feedback">Введите существующий адрес в формате "улица, номер дома".</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col sm={1} className="bc-find-button">
                      <Button variant="primary" type="submit">Найти</Button>
                    </Col>
                  </Form.Row>
                </Form>
              </div>
              <div className="bc-map-with-card-list">
                <YMaps query={{ apikey: '2e91d220-e2a5-4fcc-9e66-3383ab222b17', load: "package.full" }} className="bc-map">
                  <Map state={this.props.mapState}
                    onLoad={this.onMapLoad}
                    onClick={this.onMapClick}
                    width="100%"
                    height="500px"
                  >
                    {this.props.currentPlaceInfo &&
                      <Placemark key="point"
                        geometry={this.props.currentPlaceInfo.coordinates}
                        options={{ preset: this.props.currentPlaceInfo.addressFound ? 'islands#yellowDotIcon' : 'islands#redStretchyIcon' }}
                        properties={{ iconContent: this.props.currentPlaceInfo.addressFound ? null : 'Адрес не найден' }} />}
                    {this.props.crewsInfo.map(crewInfo =>
                      <Placemark key={crewInfo.crew_id}
                        geometry={[crewInfo.lon, crewInfo.lat]}
                        options={{ preset: 'islands#greenAutoIcon' }} />)}
                  </Map>
                </YMaps>
                <div className="bc-crew-list">
                  {this.props.crewsInfo.map((ci) => {
                    return (
                      <div key={ci.crew_id} className="bc-crew-list-card">
                        <div className="bc-crew-icon">
                          <BsGeoAlt size="15" />
                        </div>
                        <div className="bc-crew-descr">
                          <div className="bc-car-mark-model">
                            {ci.car_mark} {ci.car_model}
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
              {this.props.crewsInfo[0] &&
                (<div className="bc-crew-order-bottom">
                  <div className="bc-crew-nearest">
                    <div className="bc-crew-nearest-label">
                      Подходящий экипаж:
                  </div>
                    <div className="bc-crew-card">
                      <GiCityCar size="100" />
                      <div className="bc-crew-card-car-info">
                        <div className="bc-car-mark-model">
                          {this.props.crewsInfo[0].car_mark}&nbsp;{this.props.crewsInfo[0].car_model}
                        </div>
                        <div>
                          {this.props.crewsInfo[0].car_color}
                        </div>
                        <div className="bc-car-number">
                          {this.props.crewsInfo[0].car_number}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Button variant="primary" size="lg" block onClick={this.props.makeOrder}>Заказать</Button>
                  </div>
                </div>
                )}
            </Col>
            <Col className="bc-layout-side-column"></Col>
          </Row>
        </Container>
        <ModalMessage show={this.props.showOrderId} onHide={() => { this.props.closeOrderMessage() }} orderId={this.props.orderId} />
      </LoadingOverlay>
    )
  }
}

export default connect(
  (state: ApplicationState) => state.orderDetails,
  OrderDetailsStore.actionCreators
)(OrderDetails as any);
