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
} from "reactstrap";
import MagicDropzone from "react-magic-dropzone";
import { Button } from "react-bootstrap";
import firebase from "../../api";
import Loading from "../../components/Loading";
import DatePicker from "react-datepicker";
import DroneList from "./DroneList";
import "react-datepicker/dist/react-datepicker.css";
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

  uploadFileToS3 = async () => {
    if (this.state.file) {
      const filename = `${new Date().toISOString()}.png`;
      if (this.loadingRef && this.loadingRef.current) {
        this.loadingRef.current.setLoading();
      }
      if (this.state.address === "") {
        return alert("No information address");
      }
      if (!this.state.startDate) {
        return alert("No information time");
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
                  bboxes: this.state.predictionsImage,
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
                })
                .catch((error) => {
                  console.log(error);
                  if (this.loadingRef && this.loadingRef.current) {
                    this.loadingRef.current.hideLoading();
                  }
                });
            });
        }
      );
    }
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
        `${prediction.class} - ${Number(prediction.score.toFixed(2))}`
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
        `${prediction.class} - ${Number(prediction.score.toFixed(2))}`,
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
          annotation: prediction.class,
          h: prediction.bbox[3],
          w: prediction.bbox[2],
          y: prediction.bbox[1],
          x: prediction.bbox[0],
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

        requestAnimationFrame(() => {
          this.detectFrame(video, model);
        });
      });
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
            Start
          </button>
          <button id="btn-right" onClick={() => this.stopTracking()}>
            Stop
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
        <footer>&copy; FourOhFour 2019</footer>
      </div>
    );
  };
  renderImage = () => {
    return (
      <div
        style={{ flex: 1, justifyContent: "center", alignContent: "center" }}
        className="Dropzone-page"
      >
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
          />
        </div>
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

        <Button
          style={{ padding: 20 }}
          variant="primary"
          onClick={this.uploadFileToS3}
        >
          Submit
        </Button>
      </div>
    );
  };

  renderAll() {
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
              <CardTitle tag="h5">Tracking</CardTitle>
              <p className="card-category">Handcrafted by our colleague </p>
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
                      Check Video
                    </Button>
                    <Button
                      variant="success"
                      style={{ padding: 20 }}
                      onClick={() => {
                        this.setState({ setImage: 1, setVideo: 0 });
                      }}
                    >
                      Check Image
                    </Button>
                  </Row>
                  {this.renderAll()}
                </Col>
              </Row>

              <Loading ref={this.loadingRef} />
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
