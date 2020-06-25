import React from "react";
import { Card, CardHeader, CardBody, Button } from "reactstrap";
export default class ItemHistory extends React.Component {
  navigateToDetail = () => {
    const { item, detailRef } = this.props;

    if (detailRef && detailRef.current) {
      detailRef.current.setModalOpen(item);
    }
  };
  render() {
    const { item } = this.props;
    const date = new Date(item.createAt.seconds * 1000).toLocaleDateString();
    return (
      <Card>
        <CardHeader>
          <img src={item.image} style={{ height: 200, width: 300 }} />
        </CardHeader>
        <CardBody>
          <p className="card-category">{`Ngày tạo ${date}`}</p>
          <Button onClick={this.navigateToDetail}>Detail</Button>
        </CardBody>
      </Card>
    );
  }
}
