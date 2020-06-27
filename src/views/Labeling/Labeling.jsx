import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Table,
} from "reactstrap";
import { Annotator } from "image-labeler-react";
import "./Label.css";
import MagicDropzone from "react-magic-dropzone";
import firebase from "../../api/";
import RingLoader from "react-spinners/RingLoader";
import { css } from "@emotion/core";

import "react-datepicker/dist/react-datepicker.css";
const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
  z-index: 1;
`;

export default class LabelingTool extends React.Component {
  state = {
    preview: "",
    annotations: [],
    defaultBoxs: [],
    file: null,
    startDate: new Date(),
    address: "",
    isLoading: false,
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
    const userfixed = this.userfixed.value;
    if (this.state.isLoading === false) {
      this.setState({ isLoading: true });
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
                createAt: firebase.firestore.Timestamp.fromDate(new Date(date)),
                address: address,
                username: username,
                province: province,
                district: district,
                note: note,
                status: "Chưa hoàn thành",
                userfixed: userfixed,
              })
              .then(() => {
                this.setState({
                  isLoading: false,
                  preview: "",
                  file: null,
                  annotations: null,
                });
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

  renderLabelData = () => {
    if (
      this.state.annotations.boxes &&
      this.state.annotations.boxes.length > 0
    ) {
      return (
        <Table responsive>
          <thead className="text-primary">
            <tr>
              <th>Số thứ tự</th>
              <th>Vị trí bị lỗi</th>
              <th>Lỗi gì</th>
              <th>Mức độ nghiêm trọng</th>
            </tr>
          </thead>
          <tbody>
            {this.state.annotations.boxes.map((item, index) => {
              return (
                <tr key={index.toString()}>
                  <td>{`${index + 1}`}</td>
                  <td>{item.annotation}</td>
                  <td>
                    <FormGroup>
                      <Input
                        type="select"
                        name="select"
                        id="exampleSelect"
                        innerRef={(ref) => (this.error = ref)}
                      >
                        <option>Bị gãy</option>
                        <option>Bị vỡ</option>
                        <option>Bị đổ</option>
                        <option>Bị cháy</option>
                      </Input>
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Input
                        type="select"
                        name="select"
                        id="exampleSelect"
                        innerRef={(ref) => (this.errorate = ref)}
                      >
                        <option>Vấn đề nhẹ, giải quyết nhanh</option>
                        <option>Lỗi vừa, giải quyết sau một giờ</option>
                        <option>Lỗi nặng, cần nhiều người</option>
                        <option>Lỗi cực nặng, cần họp</option>
                      </Input>
                    </FormGroup>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      );
    }
  };
  onFormSubmit = (e) => {
    e.preventDefault();
    if (this.annoRef && this.annoRef.current) {
      this.setState(
        {
          annotations: this.annoRef.current.getPostData(),
        },
        () => {
          this.uploadAnnotation();
        }
      );
    }
  };
  drawLabelEnd = () => {
    if (this.annoRef && this.annoRef.current) {
      this.setState({
        annotations: this.annoRef.current.getPostData(),
      });
    }
  };

  render() {
    return (
      <div className="content">
        {this.state.isLoading ? (
          <RingLoader
            css={override}
            size={150}
            color={"#123abc"}
            loading={this.state.isLoading}
          />
        ) : (
          <Col md="12">
            <Card>
              <CardHeader>
                <CardTitle tag="h5">Phát hiện sự cố thủ công</CardTitle>
                <p className="card-category">
                  Người dùng trực tiếp phát hiện, trong trường hợp hệ thống ko
                  phát hiện ra
                </p>
              </CardHeader>

              <CardBody>
                <Row>
                  <Col md="7">
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
                          <div className="App">
                            <Row>
                              <Col md="12">
                                <Annotator
                                  ref={this.annoRef}
                                  height={500}
                                  width={500}
                                  imageUrl={this.state.preview}
                                  defaultBoxes={this.state.defaultBoxs}
                                  drawLabelEnd={this.drawLabelEnd}
                                  types={[
                                    "Cable",
                                    "Capacitor",
                                    "Brushing",
                                    "Connector",
                                  ]}
                                  defaultType={"Cable"}
                                />
                              </Col>
                              {/* <Col
                                md="6"
                                style={{ marginTop: 30, padding: 30 }}
                              >
                                {this.renderLabelData()}
                              </Col> */}
                            </Row>
                            <Row>
                              <Col md="12">{this.renderLabelData()}</Col>
                            </Row>
                          </div>
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col md={5}>
                    <Form onSubmit={this.onFormSubmit} style={{ padding: 50 }}>
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
                        <Label for="exampleSelect">
                          Tỉnh/Thành phố thực hiên
                        </Label>
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
                          placeholder="Địa chỉ cụ thể"
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
                          innerRef={(ref) => (this.note = ref)}
                          placeholder="Ghi chú kiểm tra"
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label for="exampleEmail">Người đi sửa lỗi</Label>
                        <Input
                          type="select"
                          name="username"
                          id="username"
                          placeholder="Tên người thực hiện kiểm tra"
                          innerRef={(ref) => (this.userfixed = ref)}
                        >
                          <option>Nguyễn Đình Tuấn Anh</option>
                          <option>Hoàng Việt Cường</option>
                          <option>Hùng Cường</option>
                          <option>Tiến Tài</option>
                          <option>Như Hoàng</option>
                        </Input>
                      </FormGroup>

                      <Button type="submit" variant="primary">
                        Gửi kết quả
                      </Button>
                    </Form>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        )}
      </div>
    );
  }
}
