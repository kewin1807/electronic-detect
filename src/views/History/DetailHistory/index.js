import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Modal,
  ModalBody,
  Input,
} from "reactstrap";
import { Annotator } from "image-labeler-react";
import { Button } from "react-bootstrap";
import Loading from "../../../components/Loading";
import firebase from "../../../api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
class DetailHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      preview: "",
      annotations: null,
      defaultBoxs: [],
      isOpen: false,
      item: null,
      startDate: null,
    };
  }
  annoRef = React.createRef();
  loadingRef = React.createRef();

  setModalOpen = (item) => {
    this.setState({ isOpen: true }, () => this.setStateAnnotation(item));
  };
  setOpenClose = () => {
    this.setState({ isOpen: false });
  };
  toggle = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };
  setStateAnnotation = (item) => {
    this.setState({
      item: item,
      annotations: { boxes: item.bboxes },
      defaultBoxs: item.bboxes,
      startDate: new Date(item.createAt.seconds * 1000),
    });
  };

  renderLabelData = () => {
    if (
      this.state.annotations.boxes &&
      this.state.annotations.boxes.length > 0
    ) {
      return this.state.annotations.boxes.map((item, index) => {
        return (
          <div key={index}>
            <Button
              variant="primary"
              // onClick={() => {
              //   this.setState({ defaultBoxs: [item] }, () => {});
              // }}
            >
              {item.annotation}
            </Button>
          </div>
        );
      });
    }
  };
  updateData = (labeledData) => {
    const { item } = this.state;
    if (this.loadingRef && this.loadingRef.current) {
      this.loadingRef.current.setLoading();
    }
    firebase
      .firestore()
      .collection("historyLabel")
      .doc(item.id)
      .set({
        image: item.image,
        bboxes: labeledData.boxes,
        updateTime: firebase.firestore.FieldValue.serverTimestamp(),
        createAt: item.createAt,
        address: this.state.address !== "" ? this.state.address : item.address,
      })
      .then(() => {
        if (this.loadingRef && this.loadingRef.current) {
          this.loadingRef.current.hideLoading();
        }
        alert("Update Sucess");
      })
      .catch((error) => {
        if (this.loadingRef && this.loadingRef.current) {
          this.loadingRef.current.hideLoading();
        }
        console.log(error);
      });
  };
  handleChange = (date) => {
    this.setState({
      startDate: date,
    });
  };
  handleChangeAddress = (e) => {
    this.setState({
      address: e.target.value,
    });
  };

  render() {
    const { item, isOpen } = this.state;
    const date = item
      ? new Date(item.createAt.seconds * 1000).toLocaleDateString()
      : "";
    return (
      <Modal isOpen={isOpen} toggle={this.toggle} className="modal-lg">
        <ModalBody>
          {item ? (
            <div className="content">
              <Col md="12">
                <Card>
                  <CardHeader>
                    <CardTitle tag="h5">History</CardTitle>
                    <p className="card-category">{`Ngày tạo ${date}`} </p>
                  </CardHeader>

                  <CardBody>
                    <Row>
                      <Col md="12">
                        <Row>
                          <div style={{ width: 468 }}>
                            <DatePicker
                              selected={this.state.startDate}
                              onChange={(date) => this.handleChange(date)}
                              placeholderText="Chọn ngày phát hiện sự cố..."
                            />
                          </div>
                          <div style={{ paddingTop: 20 }}>
                            <Input
                              style={{ width: 468 }}
                              placeholder="Địa điểm "
                              onChange={(e) => this.handleChangeAddress(e)}
                              defaultValue={item.address ? item.address : ""}
                            />
                          </div>
                          <Col md="9">
                            <Annotator
                              ref={this.annoRef}
                              height={550}
                              width={500}
                              imageUrl={item.image}
                              asyncUpload={async (labeledData) => {
                                this.setState(
                                  { annotations: labeledData },
                                  () => {
                                    this.updateData(labeledData);
                                  }
                                );
                              }}
                              defaultBoxes={item.bboxes}
                              types={[
                                "Cable",
                                "Capacitor",
                                "Brushing",
                                "Connector",
                              ]}
                              defaultType={"Cable"}
                            />
                          </Col>
                          <Col md="3" style={{ marginTop: 30, padding: 30 }}>
                            {this.renderLabelData()}
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
              <Loading ref={this.loadingRef} />
            </div>
          ) : null}
        </ModalBody>
      </Modal>
    );
  }
}
export default DetailHistory;
