import React from "react";
import Item from "../components/Item";
import firebase from "../../../api";
import { FormGroup, Row, Col, Label, Input } from "reactstrap";
import constants from "../../../constants";
import Pagination from "./Paginations";
import RingLoader from "react-spinners/RingLoader";
import { css } from "@emotion/core";
const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
  z-index: 1;
`;
export default class TotalHistory extends React.Component {
  loading = React.createRef();
  detailRef = React.createRef();
  queryRef = firebase.firestore().collection("historyLabel");
  state = {
    histories: [],
    dropdownOpen: false,
    value: "All",
    totalItems: 0,
    startSnapshot: null,
    endSnapshot: null,
    isLoading: false,
  };

  componentDidMount() {
    this.getData();
  }
  querySearchHistory = (e) => {
    if (this.timeOut) {
      clearTimeout(this.timeOut);
    }
    this.timeOut = setTimeout(() => {
      this.getData();
    }, 200);
  };

  getData = () => {
    const queryRef = firebase.firestore().collection("historyLabel");
    this.queryRef = queryRef;
    this.setState({ isLoading: true });
    if (this.date_start.value !== "") {
      const timestamp1 = firebase.firestore.Timestamp.fromDate(
        new Date(this.date_start.value)
      );
      this.queryRef = this.queryRef.where("createAt", ">=", timestamp1);
    }
    if (this.date_end.value !== "") {
      const timestamp2 = firebase.firestore.Timestamp.fromDate(
        new Date(this.date_end.value)
      );
      this.queryRef = this.queryRef.where("createAt", "<=", timestamp2);
    }
    if (this.province.value !== "") {
      this.queryRef = this.queryRef.where(
        "province",
        "==",
        this.province.value
      );
    }
    if (this.district.value !== "") {
      this.queryRef = this.queryRef.where(
        "district",
        "==",
        this.district.value
      );
    }

    this.queryRef
      .orderBy("createAt", "desc")
      .get()
      .then((querySnapshots) => {
        this.queryRef
          .orderBy("createAt", "desc")
          .limit(constants.limitQuery)
          .get()
          .then((snapshots) => {
            let history = [];
            snapshots.forEach((doc) => {
              const item = doc.data();
              item.id = doc.id;
              history.push(item);
            });

            this.setState(
              {
                histories: history,
                totalItems: querySnapshots.size,
                startSnapshot: snapshots.docs[0],
                endSnapshot: snapshots.docs[snapshots.docs.length - 1],
              },
              () => {
                this.setState({ isLoading: false });
              }
            );
          });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ isLoading: false }, () => {
          return alert("Đã có lỗi xảy ra");
        });
      });
  };

  queryWithPagination = (history, callback) => {
    this.setState({ histories: history }, () => {
      callback();
    });
  };

  renderItem = () => {
    const { history } = this.props;
    if (this.state.histories.length > 0) {
      return this.state.histories.map((item, key) => {
        // return (
        //   <div key={key}>
        //     <Link
        //       to={{ pathname: "/admin/history/" + item.id, item: item }}
        //       component={Item}
        //     ></Link>
        //   </div>
        // );
        return (
          <Item
            item={item}
            key={key}
            history={history}
            detailRef={this.detailRef}
            getData={this.getData}
          />
        );
      });
    }
    return;
  };
  render() {
    return (
      <div className="content">
        <div style={{ alignItems: "flex-end", margin: 20 }}>
          <Row>
            <Col md={3}>
              <FormGroup>
                <Label for="exampleSelect">Tỉnh/Thành phố thực hiên</Label>
                <Input
                  type="select"
                  name="select"
                  id="exampleSelect"
                  innerRef={(ref) => (this.province = ref)}
                  onChange={this.querySearchHistory}
                >
                  <option>Hà Nội</option>
                  <option>Đà Nẵng</option>
                  <option>Cần Thơ</option>
                  <option>Thành phố Hồ Chí Minh</option>
                </Input>
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label for="exampleSelect">Huyện/Quận</Label>
                <Input
                  type="select"
                  name="select"
                  id="exampleSelect"
                  innerRef={(ref) => (this.district = ref)}
                  onChange={this.querySearchHistory}
                >
                  <option>Quận Đống Đa</option>
                  <option>Quận Thanh Xuân</option>
                  <option>Quận Hai Bà Trưng</option>
                  <option>Quận Ba Đình</option>
                </Input>
              </FormGroup>
            </Col>

            <Col md={3}>
              <FormGroup>
                <Label for="exampleDate">Thời gian (bắt đầu)</Label>
                <Input
                  innerRef={(ref) => (this.date_start = ref)}
                  type="date"
                  name="date"
                  id="exampleDate"
                  placeholder="date placeholder"
                  onChange={this.querySearchHistory}
                />
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label for="exampleDate">Thời gian (kết thúc)</Label>
                <Input
                  innerRef={(ref) => (this.date_end = ref)}
                  type="date"
                  name="date"
                  id="exampleDate"
                  placeholder="date placeholder"
                  onChange={this.querySearchHistory}
                />
              </FormGroup>
            </Col>
          </Row>
          {/* <Row>
            <Col md={3}>
              <FormGroup>
                <Label for="exampleEmail">Tên nhân viên</Label>
                <Input
                  type="select"
                  name="username"
                  id="username"
                  placeholder="Tên người thực hiện kiểm tra"
                  innerRef={(ref) => (this.username = ref)}
                >
                  <option disabled selected value>
                    Tên công nhân
                  </option>
                  <option>Nguyễn Đình Tuấn Anh</option>
                  <option>Hoàng Việt Cường</option>
                  <option>Hùng Cường</option>
                  <option>Tiến Tài</option>
                  <option>Như Hoàng</option>
                </Input>
              </FormGroup>
            </Col>
          </Row> */}
        </div>
        {this.state.isLoading ? (
          <div
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <RingLoader
              css={override}
              size={150}
              color={"#123abc"}
              loading={this.state.isLoading}
            />
          </div>
        ) : (
          <div
            id="mainContent"
            className="container"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gridGap: "10px",
              gridAutoRows: "minMax(100px, auto)",
            }}
          >
            {/* <Router>
            {this.renderItem()}
            <Route path="/admin/history:id" component={DetailHistory} />
          </Router> */}
            {this.renderItem()}
          </div>
        )}
        {/* <div> */}
        {this.state.startSnapshot ? (
          <Pagination
            firebaseRef={this.queryRef}
            loadingRef={this.loading}
            queryWithPagination={this.queryWithPagination}
            totalItems={this.state.totalItems}
            startSnapshot={this.state.startSnapshot}
            endSnapshot={this.state.endSnapshot}
          />
        ) : null}

        {/* </div> */}
      </div>
    );
  }
}
