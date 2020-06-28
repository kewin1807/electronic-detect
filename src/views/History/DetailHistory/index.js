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
  FormGroup,
  Form,
  Label,
  Button,
  Table,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { Annotator } from "image-labeler-react";
import firebase from "../../../api";
import "react-datepicker/dist/react-datepicker.css";
import RingLoader from "react-spinners/RingLoader";
import { css } from "@emotion/core";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
  z-index: 1;
`;
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
      isLoading: false,
      modalDelete: false,
    };
  }
  annoRef = React.createRef();
  setModalOpen = (item) => {
    this.setState({ isOpen: true }, () => this.setStateAnnotation(item));
  };
  setOpenClose = () => {
    this.setState({ isOpen: false });
  };
  toggle = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };
  toogleDelete = () => {
    this.setState({ modalDelete: !this.state.modalDelete });
  };
  setModalDeleteOpen = () => {
    this.setState({ modalDelete: true });
  };
  setModalDeleteClose = () => {
    this.setState({ modalDelete: false });
  };

  setStateAnnotation = (item) => {
    this.setState({
      item: item,
      annotations: { boxes: item.bboxes },
      defaultBoxs: item.bboxes,
    });
  };
  removeHistory = () => {
    const { item } = this.state;
    this.setModalDeleteClose();
    if (item && item.id) {
      firebase
        .firestore()
        .collection("historyLabel")
        .doc(item.id)
        .delete()
        .then(() => {
          const { getData } = this.props;
          if (getData) {
            getData();
            this.setOpenClose();
          }
        })
        .catch((error) => {
          alert("Đã xảy ra lỗi");
        });
    }
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
  updateData = (labeledData) => {
    const { item } = this.state;
    const date = this.date.value;
    const address = this.address.value;
    const username = this.username.value;
    const province = this.province.value;
    const district = this.district.value;
    const note = this.note.value;
    const status = this.status.value;
    this.setState({ isLoading: true });
    const itemUpdate = {
      id: item.id,
      image: item.image,
      bboxes: labeledData.boxes,
      updateTime: firebase.firestore.Timestamp.fromDate(new Date(date)),
      createAt: item.createAt,
      address: address,
      username: username,
      province: province,
      district: district,
      note: note,
      status: status,
    };
    firebase
      .firestore()
      .collection("historyLabel")
      .doc(item.id)
      .set({
        image: item.image,
        bboxes: labeledData.boxes,
        updateTime: firebase.firestore.Timestamp.fromDate(new Date(date)),
        createAt: item.createAt,
        address: address,
        username: username,
        province: province,
        district: district,
        note: note,
        status: status,
      })
      .then(() => {
        this.props.setItem(itemUpdate);
        this.setState(
          { isLoading: false, annotations: labeledData, item: itemUpdate },
          () => {
            alert("Cập nhật dữ liệu thành công");
          }
        );
      })
      .catch((error) => {
        this.setState({ isLoading: false }, () => {
          alert("Đã có lỗi xảy ra");
        });
      });
  };

  convertDate = (date) => {
    if (date === "") {
      return "";
    } else {
      const arr = date.split("/");

      if (arr[1].length < 2) {
        arr[1] = "0" + arr[1];
      }
      if (arr[0].length < 2) {
        arr[0] = "0" + arr[0];
      }
      return `${arr[2]}-${arr[0]}-${arr[1]}`;
    }
  };
  onSubmit = (e) => {
    e.preventDefault();
    if (this.annoRef && this.annoRef.current) {
      const uploadedData = this.annoRef.current.getPostData();
      this.updateData(uploadedData);
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
    const { item, isOpen } = this.state;
    const date = item
      ? new Date(item.createAt.seconds * 1000).toLocaleDateString()
      : "";
    const updateTime =
      item && item.updateTime
        ? new Date(item.updateTime.seconds * 1000).toLocaleDateString()
        : date;
    const defaultDate = this.convertDate(updateTime);
    return (
      <Modal isOpen={isOpen} toggle={this.toggle} className="modal-lg">
        <ModalBody>
          {this.state.isLoading ? (
            <RingLoader
              css={override}
              size={150}
              color={"#123abc"}
              loading={this.state.isLoading}
            />
          ) : item ? (
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
                          <Col md="9">
                            <Annotator
                              ref={this.annoRef}
                              height={550}
                              width={500}
                              imageUrl={item.image}
                              defaultBoxes={item.bboxes}
                              drawLabelEnd={this.drawLabelEnd}
                              types={[
                                "Dây cáp điện",
                                "Tụ điện",
                                "Tụ sứ",
                                "Dây nối",
                              ]}
                              defaultType={"Dây cáp điện"}
                            />
                          </Col>
                          <Col md="3">
                            <Button
                              style={{ padding: 20 }}
                              variant="primary"
                              onClick={this.setModalDeleteOpen}
                            >
                              Xoá dữ liệu
                            </Button>
                          </Col>
                        </Row>
                        <Row>
                          <Col md="11">{this.renderLabelData()}</Col>
                        </Row>
                      </Col>
                    </Row>
                    <Form style={{ padding: 50 }} onSubmit={this.onSubmit}>
                      <FormGroup>
                        <Label for="exampleEmail">Người thực hiện</Label>
                        <Input
                          defaultValue={item.username}
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
                        <Label for="exampleSelect">
                          Tỉnh/Thành phố thực hiên
                        </Label>
                        <Input
                          type="select"
                          name="select"
                          id="exampleSelect"
                          defaultValue={item.province}
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
                          defaultValue={item.district}
                          innerRef={(ref) => (this.district = ref)}
                        >
                          <option>Quận Đống Đa</option>
                          <option>Quận Thanh Xuân</option>
                          <option>Quận Hai Bà Trưng</option>
                          <option>Quận Ba Đình</option>
                        </Input>
                      </FormGroup>

                      <FormGroup>
                        <Label for="exampleDate">
                          Thời gian thực hiện update công việc
                        </Label>
                        <Input
                          type="date"
                          name="date"
                          id="exampleDate"
                          placeholder="date placeholder"
                          defaultValue={defaultDate}
                          innerRef={(ref) => (this.date = ref)}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label for="exampleEmail">Trụ điện</Label>
                        <Input
                          type="text"
                          name="note"
                          id="note"
                          placeholder="Trụ điện số"
                          defaultValue={item.address}
                          innerRef={(ref) => (this.address = ref)}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label for="exampleEmail">Ghi chú</Label>
                        <Input
                          type="text"
                          name="note"
                          id="note"
                          placeholder="Ghi chú kiểm tra"
                          defaultValue={item.note}
                          innerRef={(ref) => (this.note = ref)}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label for="exampleSelect">Trạng thái</Label>
                        <Input
                          type="select"
                          name="select"
                          id="exampleSelect"
                          defaultValue={item.status}
                          innerRef={(ref) => (this.status = ref)}
                        >
                          <option>Đã hoàn thành</option>
                          <option>Chưa hoàn thành</option>
                        </Input>
                      </FormGroup>
                      <Button
                        style={{ paddingHorizontal: 20 }}
                        variant="primary"
                      >
                        Sửa chi tiết
                      </Button>
                    </Form>
                  </CardBody>
                </Card>
              </Col>
            </div>
          ) : null}
          <Modal isOpen={this.state.modalDelete} toggle={this.toogleDelete}>
            <ModalHeader toggle={this.toogleDelete}>Modal title</ModalHeader>
            <ModalBody>Bạn có chắc chắn muốn xoá dữ liệu này</ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={this.removeHistory}>
                Chắc chắn
              </Button>{" "}
              <Button color="secondary" onClick={this.toogleDelete}>
                Không
              </Button>
            </ModalFooter>
          </Modal>
        </ModalBody>
      </Modal>
    );
  }
}
export default DetailHistory;
