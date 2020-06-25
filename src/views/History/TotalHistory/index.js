import React from "react";
import Item from "../components/Item";
import firebase from "../../../api";
import Loading from "../../../components/Loading";
import {
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  InputGroup,
  InputGroupAddon,
  Row,
  Col,
  InputGroupText,
} from "reactstrap";
import constants from "../../../constants";
import Pagination from "./Paginations";
import DetailHistory from "../DetailHistory";
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
  };

  componentDidMount() {
    this.getData();
  }
  toggle = () => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  };

  select = (event) => {
    this.setState(
      {
        dropdownOpen: !this.state.dropdownOpen,
        value: event.target.innerText,
      },
      () => {
        this.querySearchHistory();
      }
    );
  };
  querySearchHistory = () => {
    if (this.timeOut) {
      clearTimeout(this.timeOut);
    }
    this.timeOut = setTimeout(() => {
      this.getData();
    }, 200);
  };

  getData = () => {
    const queryRef = firebase.firestore().collection("historyLabel");
    if (this.loading && this.loading.current) {
      this.loading.current.setLoading();
    }
    if (this.state.value === "7 days") {
      const firstDay = new Date();
      const secondDay = new Date(firstDay.getTime() - 7 * 24 * 60 * 60 * 1000);
      const timestamp1 = firebase.firestore.Timestamp.fromDate(firstDay);
      const timestamp2 = firebase.firestore.Timestamp.fromDate(secondDay);
      this.queryRef = queryRef
        .where("createAt", "<=", timestamp1)
        .where("createAt", ">=", timestamp2);
    }
    if (this.state.value === "1 Month") {
      const firstDay = new Date();
      const secondDay = new Date(firstDay.getTime() - 30 * 24 * 60 * 60 * 1000);
      const timestamp1 = firebase.firestore.Timestamp.fromDate(firstDay);
      const timestamp2 = firebase.firestore.Timestamp.fromDate(secondDay);
      this.queryRef = queryRef
        .where("createAt", "<=", timestamp1)
        .where("createAt", ">=", timestamp2);
    }
    if (this.state.value !== "1 Month" || this.state.value !== "7 days") {
      this.queryRef = queryRef;
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
                if (this.loading && this.loading.current) {
                  this.loading.current.hideLoading();
                }
              }
            );
          });
      })
      .catch((error) => {
        if (this.loading && this.loading.current) {
          this.loading.current.hideLoading();
        }
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
          />
        );
      });
    }
    return null;
  };
  render() {
    return (
      <div className="content">
        <div style={{ alignItems: "flex-end", margin: 20 }}>
          <Row>
            <Col>
              <ButtonDropdown
                isOpen={this.state.dropdownOpen}
                toggle={this.toggle}
              >
                <DropdownToggle>{this.state.value}</DropdownToggle>
                <DropdownMenu>
                  <DropdownItem onClick={this.select}>7 days</DropdownItem>
                  <DropdownItem onClick={this.select}>1 Month</DropdownItem>
                  <DropdownItem onClick={this.select}>All</DropdownItem>
                </DropdownMenu>
              </ButtonDropdown>
            </Col>
            <Col>
              <form>
                <InputGroup className="no-border">
                  <Input placeholder="Search..." />
                  <InputGroupAddon addonType="append">
                    <InputGroupText>
                      <i className="nc-icon nc-zoom-split" />
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </form>
            </Col>
          </Row>
        </div>
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
        <div style={{ zIndex: 1, alignItems: "center" }}>
          <Loading ref={this.loading} />
        </div>
        <DetailHistory ref={this.detailRef} />
      </div>
    );
  }
}
