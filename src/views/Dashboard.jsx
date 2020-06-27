/*!

=========================================================
* Paper Dashboard React - v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/paper-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)

* Licensed under MIT (https://github.com/creativetimofficial/paper-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
// react plugin used to create charts
import { Line, Pie, Bar } from "react-chartjs-2";
// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Row,
  Col,
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
// core components
import {
  dashboard24HoursPerformanceChart,
  dashboardEmailStatisticsChart,
  dashboardNASDAQChart,
} from "variables/charts.jsx";
const DATA_LAST_DAY = {
  data: (canvas) => {
    return {
      labels: ["Dây cáp điện", "Tụ điện", "Tụ sứ", "Dây nối"],
      datasets: [
        {
          label: "Emails",
          pointRadius: 0,
          pointHoverRadius: 0,
          backgroundColor: ["#e3e3e3", "#4acccd", "#fcc468", "#ef8157"],
          borderWidth: 0,
          data: [30, 20, 30, 10],
        },
      ],
    };
  },
  options: {
    legend: {
      display: true,
    },

    pieceLabel: {
      render: "percentage",
      fontColor: ["white"],
      precision: 2,
    },

    tooltips: {
      enabled: true,
    },

    scales: {
      yAxes: [
        {
          ticks: {
            display: false,
          },
          gridLines: {
            drawBorder: false,
            zeroLineColor: "transparent",
            color: "rgba(255,255,255,0.05)",
          },
        },
      ],

      xAxes: [
        {
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: "rgba(255,255,255,0.1)",
            zeroLineColor: "transparent",
          },
          ticks: {
            display: false,
          },
        },
      ],
    },
  },
};

const DATA_7_DAYS = {
  data: (canvas) => {
    return {
      labels: ["Dây cáp điện", "Tụ điện", "Tụ sứ", "Dây nối"],
      datasets: [
        {
          label: "Emails",
          pointRadius: 0,
          pointHoverRadius: 0,
          backgroundColor: ["#e3e3e3", "#4acccd", "#fcc468", "#ef8157"],
          borderWidth: 0,
          data: [80, 50, 70, 100],
        },
      ],
    };
  },
  options: {
    legend: {
      display: true,
    },

    pieceLabel: {
      render: "percentage",
      fontColor: ["white"],
      precision: 2,
    },

    tooltips: {
      enabled: true,
    },

    scales: {
      yAxes: [
        {
          ticks: {
            display: false,
          },
          gridLines: {
            drawBorder: false,
            zeroLineColor: "transparent",
            color: "rgba(255,255,255,0.05)",
          },
        },
      ],

      xAxes: [
        {
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: "rgba(255,255,255,0.1)",
            zeroLineColor: "transparent",
          },
          ticks: {
            display: false,
          },
        },
      ],
    },
  },
};

const DATA_LAST_MONTH = {
  data: (canvas) => {
    return {
      labels: ["Dây cáp điện", "Tụ điện", "Tụ sứ", "Dây nối"],
      datasets: [
        {
          label: "Emails",
          pointRadius: 0,
          pointHoverRadius: 0,
          backgroundColor: ["#e3e3e3", "#4acccd", "#fcc468", "#ef8157"],
          borderWidth: 0,
          data: [200, 90, 80, 170],
        },
      ],
    };
  },
  options: {
    legend: {
      display: true,
    },

    pieceLabel: {
      render: "percentage",
      fontColor: ["white"],
      precision: 2,
    },

    tooltips: {
      enabled: true,
    },

    scales: {
      yAxes: [
        {
          ticks: {
            display: false,
          },
          gridLines: {
            drawBorder: false,
            zeroLineColor: "transparent",
            color: "rgba(255,255,255,0.05)",
          },
        },
      ],

      xAxes: [
        {
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: "rgba(255,255,255,0.1)",
            zeroLineColor: "transparent",
          },
          ticks: {
            display: false,
          },
        },
      ],
    },
  },
};

class Dashboard extends React.Component {
  state = {
    dropdownOpen: false,
    value: "LastDay",
    dataPice: DATA_LAST_DAY.data,
  };

  toggle = () => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  };

  select = (event) => {
    let dataPice = this.state.dataPice;
    if (event.target.innerText === "7 ngày gần nhất") {
      dataPice = DATA_7_DAYS.data;
    }
    if (event.target.innerText === "Tháng gần nhất") {
      dataPice = DATA_LAST_MONTH.data;
    } else {
      dataPice = DATA_LAST_DAY.data;
    }
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
      value: event.target.innerText,
      dataPice: dataPice,
    });
  };
  render() {
    return (
      <>
        <div className="content">
          <Row>
            <Col lg="3" md="6" sm="6">
              <Card className="card-stats">
                <CardBody>
                  <Row>
                    <Col md="4" xs="5">
                      <div className="icon-big text-center icon-warning">
                        <i className="nc-icon nc-globe text-warning" />
                      </div>
                    </Col>
                    <Col md="8" xs="7">
                      <div className="numbers">
                        <p className="card-category">Lượng truy cập web</p>
                        <CardTitle tag="p">150</CardTitle>
                        <p />
                      </div>
                    </Col>
                  </Row>
                </CardBody>
                <CardFooter>
                  <hr />
                  <div className="stats">
                    <i className="fas fa-sync-alt" /> 7 ngày gần nhất
                  </div>
                </CardFooter>
              </Card>
            </Col>
            <Col lg="3" md="6" sm="6">
              <Card className="card-stats">
                <CardBody>
                  <Row>
                    <Col md="4" xs="5">
                      <div className="icon-big text-center icon-warning">
                        <i className="nc-icon nc-money-coins text-success" />
                      </div>
                    </Col>
                    <Col md="8" xs="7">
                      <div className="numbers">
                        <p className="card-category">Báo cáo</p>
                        <CardTitle tag="p">5</CardTitle>
                        <p />
                      </div>
                    </Col>
                  </Row>
                </CardBody>
                <CardFooter>
                  <hr />
                  <div className="stats">
                    <i className="far fa-calendar" /> Ngày hôm qua
                  </div>
                </CardFooter>
              </Card>
            </Col>
            <Col lg="3" md="6" sm="6">
              <Card className="card-stats">
                <CardBody>
                  <Row>
                    <Col md="4" xs="5">
                      <div className="icon-big text-center icon-warning">
                        <i className="nc-icon nc-vector text-danger" />
                      </div>
                    </Col>
                    <Col md="8" xs="7">
                      <div className="numbers">
                        <p className="card-category">Lượng sự cố còn lại</p>
                        <CardTitle tag="p">23</CardTitle>
                        <p />
                      </div>
                    </Col>
                  </Row>
                </CardBody>
                <CardFooter>
                  <hr />
                  <div className="stats">
                    <i className="far fa-clock" /> 7 ngày gần nhất
                  </div>
                </CardFooter>
              </Card>
            </Col>
            <Col lg="3" md="6" sm="6">
              <Card className="card-stats">
                <CardBody>
                  <Row>
                    <Col md="4" xs="5">
                      <div className="icon-big text-center icon-warning">
                        <i className="nc-icon nc-favourite-28 text-primary" />
                      </div>
                    </Col>
                    <Col md="8" xs="7">
                      <div className="numbers">
                        <p className="card-category">Lượng sự cố đã sửa</p>
                        <CardTitle tag="p">+45</CardTitle>
                        <p />
                      </div>
                    </Col>
                  </Row>
                </CardBody>
                <CardFooter>
                  <hr />
                  <div className="stats">
                    <i className="fas fa-sync-alt" /> 7 ngày gần nhất
                  </div>
                </CardFooter>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <Card>
                <CardHeader>
                  <CardTitle tag="h5">Thống kê số lượng sự cố</CardTitle>
                  <p className="card-category">7 ngày gần nhất</p>
                </CardHeader>
                <CardBody>
                  <Bar
                    data={dashboard24HoursPerformanceChart.data}
                    options={dashboard24HoursPerformanceChart.options}
                    width={400}
                    height={200}
                  />
                </CardBody>
                <CardFooter>
                  <hr />
                  <div className="stats">
                    <i className="fa fa-history" /> 3 phút trước
                  </div>
                </CardFooter>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md="6">
              <Card>
                <CardHeader>
                  <CardTitle tag="h5">Biểu đồ tròn thống kê sự cố </CardTitle>
                  <p className="card-category"></p>
                </CardHeader>
                <CardBody>
                  <ButtonDropdown
                    isOpen={this.state.dropdownOpen}
                    toggle={this.toggle}
                  >
                    <DropdownToggle>{this.state.value}</DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem onClick={this.select}>
                        7 ngày gần nhất
                      </DropdownItem>
                      <DropdownItem onClick={this.select}>
                        Tháng gần nhất
                      </DropdownItem>
                      <DropdownItem onClick={this.select}>
                        Ngày hôm qua
                      </DropdownItem>
                    </DropdownMenu>
                  </ButtonDropdown>
                  <Pie
                    data={this.state.dataPice}
                    options={dashboardEmailStatisticsChart.options}
                  />
                </CardBody>
              </Card>
            </Col>
            <Col md="6">
              <Card className="card-chart">
                <CardHeader>
                  <CardTitle tag="h5">Số lượng ảnh đã upload</CardTitle>
                  <p className="card-category">Biểu đồ đường</p>
                </CardHeader>
                <CardBody>
                  <Line
                    data={dashboardNASDAQChart.data}
                    options={dashboardNASDAQChart.options}
                    width={150}
                    height={55}
                  />
                </CardBody>
                <CardFooter>
                  <div className="chart-legend">
                    <i className="fa fa-circle text-info" /> Ảnh{" "}
                  </div>
                  <hr />
                </CardFooter>
              </Card>
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

export default Dashboard;
