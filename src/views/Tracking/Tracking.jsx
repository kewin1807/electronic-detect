import React, { Component } from "react";
import "./style.css";

// Import Libraries
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Input,
  Form,
  FormGroup,
  Label,
  Table,
  Button,
} from "reactstrap";
import MagicDropzone from "react-magic-dropzone";
import firebase from "../../api";
import RingLoader from "react-spinners/RingLoader";
import { css } from "@emotion/core";
import DroneList from "./DroneList";

import "react-datepicker/dist/react-datepicker.css";
const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
  z-index: 1;
`;

const labels = ["Dây sứ bị đứt"];
class Tracking extends Component {
  state = {
    btnDeviceId: null,
    model: null,
    width: 360,
    height: 480,
    preview: "",
    predictionsImage: [],
    setVideo: 0,
    setImage: 0,
    modelCoco: null,
    file: null,
    startDate: new Date(),
    address: "",
    isLoading: false,
  };

  videoRef = React.createRef();
  canvasRef = React.createRef();
  loadingRef = React.createRef();
  droneList = React.createRef();

  componentDidMount() {
    cocoSsd.load().then((model) => {
      this.setState({
        modelCoco: model,
      });
    });
  }

  uploadFileToS3 = async (e) => {
    e.preventDefault();
    if (!this.state.file) {
      return alert("Bạn chưa nhập ảnh vùng cần kiểm tra");
    }
    if (this.date.value === "" || !this.date.value) {
      return alert("Bạn chưa nhập thời gian thực hiện kiểm tra");
    }
    if (this.province.value === "" || !this.province.value) {
      return alert("Bạn chưa nhập tỉnh/thành phố thực hiện kiểm tra");
    }
    if (this.district.value === "" || !this.district.value) {
      return alert("Bạn chưa nhập huyện/quận thực hiện kiểm tra");
    }
    if (this.username.value === "" || !this.username.value) {
      return alert("Bạn chưa nhập tên người thực hiện kiểm tra");
    }
    if (this.address.value === "" || !this.address.value) {
      return alert("Bạn chưa nhập địa chỉ thực hiện kiểm tra");
    }
    const filename = `${new Date().toISOString()}.png`;
    const date = this.date.value;
    const address = this.address.value;
    const username = this.username.value;
    const province = this.province.value;
    const district = this.district.value;
    const note = this.note.value;

    this.setState({ isLoading: true });

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
                bboxes: this.state.predictionsImage,
                createAt: firebase.firestore.Timestamp.fromDate(new Date(date)),
                address: address,
                username: username,
                province: province,
                district: district,
                note: note,
                status: "Chưa hoàn thành",
              })
              .then(() => {
                this.setState({ isLoading: false, preview: "", file: null });
                alert("Đã cập nhật dữ liệu thành công");
              })
              .catch((error) => {
                this.setState({ isLoading: false }, () => {
                  alert("Đã có lỗi xảy ra");
                });
              });
          });
      }
    );
  };
  onDrop = (accepted, rejected, links) => {
    this.setState({
      preview: accepted[0].preview || links[0],
    });
  };
  convertCanvasTofile = (canvas) => {
    const url = canvas.toDataURL();
    const blobBin = atob(url.split(",")[1]);
    let array = [];
    for (var i = 0; i < blobBin.length; i++) {
      array.push(blobBin.charCodeAt(i));
    }
    const file = new Blob([new Uint8Array(array)], { type: "image/png" });
    this.setState({ file: file });
  };

  renderTableVideo = () => {
    if (this.state.predictionVideo && this.state.predictionVideo.length > 0) {
      return (
        <Table responsive>
          <thead className="text-primary">
            <tr>
              <th>Số thứ tự</th>
              <th>Lỗi gì</th>
              <th>Mức độ nghiêm trọng</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {this.state.predictionVideo.map((item, index) => {
              return (
                <tr key={index.toString()}>
                  <td>{`${index + 1}`}</td>
                  <td>{labels[0]}</td>

                  <td>{`${Number(item.score).toFixed(2)} %`}</td>
                  <td>Lỗi cơ bản</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      );
    }
  };

  cropToCanvas = (image, canvas, ctx) => {
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // ctx.drawImage(image, 0, 0);
    if (naturalWidth > naturalHeight) {
      ctx.drawImage(
        image,
        (naturalWidth - naturalHeight) / 2,
        0,
        naturalHeight,
        naturalHeight,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
    } else {
      ctx.drawImage(
        image,
        0,
        (naturalHeight - naturalWidth) / 2,
        naturalWidth,
        naturalWidth,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
    }
    this.convertCanvasTofile(canvas);
  };
  renderPredictionsModel = (predictions, ctx, font) => {
    predictions.forEach((prediction) => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      // Draw the bounding box.
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
      // Draw the label background.
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(
        `${labels[0]} - ${Number(prediction.score.toFixed(2))}`
      ).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
    });

    predictions.forEach((prediction) => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      // Draw the text last to ensure it's on top.
      ctx.fillStyle = "#000000";
      ctx.fillText(
        `${labels[0]} - ${Number(prediction.score.toFixed(2))}`,
        x,
        y
      );
    });
  };

  onImageChange = (e) => {
    const c = document.getElementById("canvas");
    const ctx = c.getContext("2d");
    this.cropToCanvas(e.target, c, ctx);
    this.state.modelCoco.detect(c).then((predictions) => {
      // Font options.
      const font = "16px sans-serif";
      ctx.font = font;
      ctx.textBaseline = "top";
      let predictionsImage = [];
      predictions.forEach((prediction) => {
        const obj = {
          annotation: labels[0],
          h: prediction.bbox[3],
          w: prediction.bbox[2],
          y: prediction.bbox[1],
          x: prediction.bbox[0],
          score: Number(prediction.score.toFixed(2)),
        };
        predictionsImage.push(obj);
      });
      this.setState({ predictionsImage: predictionsImage });
      this.renderPredictionsModel(predictions, ctx, font);
    });
  };

  startVideo() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const webCamPromise = navigator.mediaDevices
        .getUserMedia({
          video: true,
        })
        .then((stream) => {
          window.stream = stream;
          this.videoRef.current.srcObject = stream;

          navigator.mediaDevices.enumerateDevices().then((devices) => {
            devices
              .filter((device) => device.kind === "videoinput")
              .forEach((device) => {
                this.setState({
                  btnDeviceId: (
                    <button onClick={() => this.changeDevice(device.deviceId)}>
                      {device.label}
                    </button>
                  ),
                });
              });
          });

          return new Promise((resolve, reject) => {
            this.videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });
        });

      const modelPromise = cocoSsd.load();

      Promise.all([modelPromise, webCamPromise])
        .then((values) => {
          this.setState({
            model: 1,
          });
          this.detectFrame(this.videoRef.current, values[0]);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  stopTracking = () => {
    if (this.videoRef.current.srcObject) {
      this.videoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());

      this.videoRef.current.srcObject = null;
    }
  };

  detectFrame = (video, model) => {
    if (video && video.readyState >= 3) {
      model.detect(video).then((predictions) => {
        this.renderPredictions(predictions);
        this.setState({ predictionVideo: predictions });
        requestAnimationFrame(() => {
          this.detectFrame(video, model);
        });
      });
    }
  };
  renderLabelData = () => {
    if (this.state.predictionsImage && this.state.predictionsImage.length > 0) {
      return (
        <Table responsive>
          <thead className="text-primary">
            <tr>
              <th>Số thứ tự</th>
              <th>Lỗi gì</th>
              <th>Mức độ nghiêm trọng</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {this.state.predictionsImage.map((item, index) => {
              return (
                <tr key={index.toString()}>
                  <td>{`${index + 1}`}</td>
                  <td>{item.annotation}</td>

                  <td>{`${item.score} %`}</td>
                  <td>Lỗi cơ bản</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      );
    }
  };

  renderPredictions = (predictions) => {
    if (this.canvasRef && this.canvasRef.current) {
      const ctx = this.canvasRef.current.getContext("2d");

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Font options
      const font = "16px sans-serif";
      ctx.font = font;
      ctx.textBaseline = "top";
      this.renderPredictionsModel(predictions, ctx, font);
    }
  };
  /* Change device */
  changeDevice = (deviceId) => {
    if (this.videoRef.current.srcObject) {
      this.videoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());

      this.videoRef.current.srcObject = null;
    }

    navigator.mediaDevices
      .getUserMedia({
        video: {
          deviceId: deviceId,
        },
      })
      .then((stream) => (this.videoRef.current.srcObject = stream));
  };
  renderVideo = () => {
    return (
      <div>
        <div className="App">
          <div id="preview">
            <video
              autoPlay
              playsInline
              muted
              ref={this.videoRef}
              width={this.state.width}
              height={this.state.height}
              className="fixed"
            />
            <canvas
              ref={this.canvasRef}
              width={this.state.width}
              height={this.state.height}
              className="fixed"
            />
          </div>
          <div id="button-group">
            <button id="btn-left" onClick={() => this.startVideo()}>
              Bắt đầu
            </button>
            <button id="btn-right" onClick={() => this.stopTracking()}>
              Dừng lại
            </button>
          </div>
          {this.state.btnDeviceId && (
            <div class="btn-device-container">
              <p>Click button below to access back camera</p>
              <div id="btnDeviceIdContainer">{this.state.btnDeviceId}</div>
            </div>
          )}
          {!this.state.model && (
            <div
              class="loader"
              style={{
                width: this.state.width,
                height: this.state.height,
              }}
            >
              Loading model...
            </div>
          )}
        </div>
        {this.renderTableVideo()}
        <Form
          style={{ padding: 50 }}
          onSubmit={(e) => {
            e.preventDefault();
            this.setState({ isLoading: true });
            setTimeout(() => {
              this.setState({ isLoading: false }, () => {
                alert("Đã tải dữ liệu thành công");
              });
            }, 300);
          }}
        >
          <FormGroup>
            <Label for="exampleEmail">Người kiểm tra</Label>
            <Input
              type="select"
              name="username"
              id="username"
              placeholder="Tên người thực hiện kiểm tra"
              innerRef={(ref) => (this.username = ref)}
            >
              <option>Nguyễn Đình Tuấn Anh</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="exampleSelect">Tỉnh/Thành phố thực hiên</Label>
            <Input type="select" name="select" id="exampleSelect">
              <option>Hà Nội</option>
              <option>Đà Nẵng</option>
              <option>Cần Thơ</option>
              <option>Thành phố Hồ Chí Minh</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="exampleSelect">Huyện/Quận</Label>
            <Input type="select" name="select" id="exampleSelect">
              <option>Quận Đống Đa</option>
              <option>Quận Thanh Xuân</option>
              <option>Quận Hai Bà Trưng</option>
              <option>Quận Ba Đình</option>
            </Input>
          </FormGroup>

          <FormGroup>
            <Label for="exampleDate">Thời gian thực hiện</Label>
            <Input
              type="date"
              name="date"
              id="exampleDate"
              placeholder="date placeholder"
            />
          </FormGroup>
          <FormGroup>
            <Label for="exampleEmail">Ghi chú</Label>
            <Input type="text" name="note" id="note" placeholder="Ghi chú" />
          </FormGroup>
          <Button
            style={{ paddingHorizontal: 20 }}
            variant="primary"
            // onClick={this.uploadFileToS3}
          >
            Gửi kết qủa
          </Button>
        </Form>
      </div>
    );
  };
  renderImage = () => {
    return (
      <Row>
        <Col md="6">
          <div
            style={{
              flex: 1,
              justifyContent: "center",
              alignContent: "center",
            }}
            className="Dropzone-page"
          >
            <MagicDropzone
              className="Dropzone"
              accept="image/jpeg, image/png, .jpg, .jpeg, .png"
              multiple={false}
              onDrop={this.onDrop}
            >
              {this.state.preview ? (
                <img
                  alt="upload preview"
                  onLoad={this.onImageChange}
                  className="Dropzone-img"
                  src={this.state.preview}
                />
              ) : (
                "Choose or drop a file."
              )}
            </MagicDropzone>

            {this.state.preview ? <canvas id="canvas" /> : null}

            {this.renderLabelData()}
          </div>
        </Col>
        <Col md="6">
          <Form style={{ padding: 50 }} onSubmit={this.uploadFileToS3}>
            <FormGroup>
              <Label for="exampleEmail">Người kiểm tra</Label>
              <Input
                type="select"
                name="username"
                id="username"
                placeholder="Tên người thực hiện kiểm tra"
                innerRef={(ref) => (this.username = ref)}
              >
                <option>Nguyễn Đình Tuấn Anh</option>
                <option>Hoàng Việt Cường</option>
                <option>Hùng Cường</option>
                <option>Tiến Tài</option>
                <option>Như Hoàng</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="exampleSelect">Tỉnh/Thành phố thực hiên</Label>
              <Input
                type="select"
                name="select"
                id="exampleSelect"
                innerRef={(ref) => (this.province = ref)}
              >
                <option>Hà Nội</option>
                <option>Đà Nẵng</option>
                <option>Cần Thơ</option>
                <option>Thành phố Hồ Chí Minh</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="exampleSelect">Huyện/Quận</Label>
              <Input
                type="select"
                name="select"
                id="exampleSelect"
                innerRef={(ref) => (this.district = ref)}
              >
                <option>Quận Đống Đa</option>
                <option>Quận Thanh Xuân</option>
                <option>Quận Hai Bà Trưng</option>
                <option>Quận Ba Đình</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="exampleEmail">Trụ điện</Label>
              <Input
                innerRef={(ref) => (this.address = ref)}
                type="text"
                name="address"
                id="address"
                placeholder="Trụ điện số"
              />
            </FormGroup>

            <FormGroup>
              <Label for="exampleDate">Thời gian thực hiện</Label>
              <Input
                innerRef={(ref) => (this.date = ref)}
                type="date"
                name="date"
                id="exampleDate"
                placeholder="date placeholder"
              />
            </FormGroup>
            <FormGroup>
              <Label for="exampleEmail">Ghi chú</Label>
              <Input
                type="text"
                name="note"
                id="note"
                placeholder="Ghi chú kiểm tra"
                innerRef={(ref) => (this.note = ref)}
              />
            </FormGroup>

            <Button type="submit" variant="primary">
              Gửi kết quả
            </Button>
          </Form>
        </Col>
      </Row>
    );
  };

  renderAll() {
    if (this.state.isLoading) {
      return (
        <RingLoader
          css={override}
          size={150}
          color={"#123abc"}
          loading={this.state.isLoading}
        />
      );
    }
    if (this.state.setImage === 1 && this.state.setVideo === 0) {
      return this.renderImage();
    }
    if (this.state.setImage === 0 && this.state.setVideo === 1) {
      return this.renderVideo();
    } else {
      return null;
    }
  }

  render() {
    return (
      <div className="content">
        <Col md="12">
          <Card>
            <CardHeader>
              <CardTitle tag="h5">
                Phát hiện sự cố, thành phần từ động
              </CardTitle>
              <p className="card-category">
                Đây là bản demo nên model, nhãn được lấy từ trên mạng, có thể
                test bằng các ảnh thay thế như các đồ vật trong gia đình,..
              </p>
            </CardHeader>

            <CardBody>
              <Row>
                <Col md="12">
                  <Row
                    style={{ alignItems: "center", justifyContent: "center" }}
                  >
                    <Button
                      variant="success"
                      style={{ padding: 20 }}
                      onClick={() => {
                        if (this.droneList && this.droneList.current) {
                          this.droneList.current.setModalOpen();
                        }
                        // this.setState({ setImage: 0, setVideo: 1 });
                      }}
                    >
                      Check bằng camerra
                    </Button>
                    <Button
                      variant="success"
                      style={{ padding: 20, marginLeft: 20 }}
                      onClick={() => {
                        this.setState({ setImage: 1, setVideo: 0 });
                      }}
                    >
                      Check bằng ảnh
                    </Button>
                  </Row>
                  {this.renderAll()}
                </Col>
              </Row>

              <DroneList
                ref={this.droneList}
                checkVideo={() => this.setState({ setImage: 0, setVideo: 1 })}
              />
            </CardBody>
          </Card>
        </Col>
      </div>
    );
  }
}

export default Tracking;
