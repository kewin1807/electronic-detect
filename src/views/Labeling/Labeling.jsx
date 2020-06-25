import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Input,
} from "reactstrap";
import { Annotator } from "image-labeler-react";
import "./Label.css";
import MagicDropzone from "react-magic-dropzone";
import { Button } from "react-bootstrap";
import firebase from "../../api/";
import Loading from "../../components/Loading";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
export default class LabelingTool extends React.Component {
  state = {
    preview: "",
    annotations: [],
    defaultBoxs: [],
    file: null,
    startDate: new Date(),
    address: "",
  };
  annoRef = React.createRef();
  loadingref = React.createRef();

  onDrop = (accepted, rejected, links) => {
    this.setState({
      preview: accepted[0].preview || links[0],
      file: accepted[0],
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

  uploadAnnotation = () => {
    if (this.state.file) {
      if (this.state.address === "") {
        return alert("No information address");
      }
      if (!this.state.startDate) {
        return alert("No information date to complete");
      }
      const filename = `${new Date().toISOString()}.png`;
      if (this.loadingRef && this.loadingRef.current) {
        this.loadingRef.current.setLoading();
      }
      const uploadTask = firebase
        .storage()
        .ref(`/images/${filename}`)
        .put(this.state.file);
      uploadTask.on(
        "state_changed",
        (snapShot) => {
          //takes a snap shot of the process as it is happening
          // console.log(snapShot);
        },
        (err) => {
          //catches the errors
          // console.log(err);
        },
        () => {
          // gets the functions from storage refences the image storage in firebase by the children
          // gets the download url then sets the image from firebase as the value for the imgUrl key:
          firebase
            .storage()
            .ref(`/images/${filename}`)
            .getDownloadURL()
            .then((fireBaseUrl) => {
              firebase
                .firestore()
                .collection("historyLabel")
                .add({
                  image: fireBaseUrl,
                  bboxes: this.state.annotations.boxes,
                  createAt: firebase.firestore.Timestamp.fromDate(
                    this.state.startDate
                  ),
                  address: this.state.address,
                })
                .then(() => {
                  if (this.loadingRef && this.loadingRef.current) {
                    this.loadingRef.current.hideLoading();
                  }
                  alert("Upload Success");
                  this.setState({ preview: "", file: null });
                })
                .catch((error) => {
                  if (this.loadingRef && this.loadingRef.current) {
                    this.loadingRef.current.hideLoading();
                  }
                });
            });
        }
      );
    }
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

  render() {
    return (
      <div className="content">
        <Col md="12">
          <Card>
            <CardHeader>
              <CardTitle tag="h5">Label Tool</CardTitle>
              <p className="card-category">Handcrafted by our colleague </p>
            </CardHeader>

            <CardBody>
              <Row>
                <Col md="12">
                  <div className="Dropzone-page">
                    {this.state.preview === "" ? (
                      <MagicDropzone
                        className="Dropzone"
                        accept="image/jpeg, image/png, .jpg, .jpeg, .png"
                        multiple={false}
                        onDrop={this.onDrop}
                      >
                        "Choose or drop a file."
                      </MagicDropzone>
                    ) : (
                      <div>
                        <div style={{ width: 468, paddingLeft: 20 }}>
                          <DatePicker
                            selected={this.state.startDate}
                            onChange={(date) => this.handleChange(date)}
                            placeholderText="Chọn ngày phát hiện sự cố..."
                          />
                        </div>
                        <div className="App">
                          {/* <InputGroup style={{ width: 468, paddingTop: 20 }}> */}
                          <div style={{ padding: 20 }}>
                            <Input
                              style={{ width: 468 }}
                              placeholder="Địa điểm "
                              onChange={(e) => this.handleChangeAddress(e)}
                            />
                          </div>
                          {/* </InputGroup> */}
                          <Row>
                            <Col md="9">
                              <Annotator
                                ref={this.annoRef}
                                height={600}
                                width={600}
                                imageUrl={this.state.preview}
                                asyncUpload={async (labeledData) => {
                                  this.setState(
                                    { annotations: labeledData },
                                    () => {
                                      this.uploadAnnotation();
                                    }
                                  );
                                  // if (this.annoRef && this.annoRef.current) {
                                  //   this.annoRef.current.onDeleteAll();
                                  // }
                                  // upload labeled data
                                }}
                                defaultBoxes={this.state.defaultBoxs}
                                types={[
                                  "Cable",
                                  "Capacitor",
                                  "Brushing",
                                  "Connector",
                                ]}
                                defaultType={"Cable"}
                              />
                              <Button
                                variant="primary"
                                onClick={() => {
                                  this.setState({ preview: "" });
                                }}
                              >
                                Choose again
                              </Button>
                            </Col>
                            <Col md="3" style={{ marginTop: 30, padding: 30 }}>
                              {this.renderLabelData()}
                            </Col>
                          </Row>
                        </div>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
        <Loading ref={this.loadingref} />
      </div>
    );
  }
}
