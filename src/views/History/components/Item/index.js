import React from "react";
import { Card, CardHeader, CardBody, Button } from "reactstrap";
import DetailHistory from "../../DetailHistory";

export default class ItemHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      item: props.item,
    };
  }
  detailRef = React.createRef();
  navigateToDetail = () => {
    const { item } = this.state;
    if (this.detailRef && this.detailRef.current) {
      this.detailRef.current.setModalOpen(item);
    }
  };
  setItem = (item) => {
    this.setState({ item: item });
  };
  render() {
    const { item } = this.state;
    const date = new Date(item.createAt.seconds * 1000).toLocaleDateString();
    return (
      <div>
        <Card>
          <CardHeader>
            <img src={item.image} style={{ height: 200, width: 300 }} />
          </CardHeader>
          <CardBody>
            <p className="card-category">{`Ngày tạo ${date}`}</p>
            <p className="card-category">{`Người kiểm tra: ${
              item.username ? item.username : "Chưa xác định"
            } `}</p>
            <p className="card-category">{`Tỉnh/Thành phố: ${
              item.province ? item.province : "Chưa xác định"
            } `}</p>
            <p className="card-category">{`Huyện/Quận: ${
              item.district ? item.district : "Chưa xác định"
            } `}</p>
            <Button onClick={this.navigateToDetail}>Chi tiết</Button>
          </CardBody>
        </Card>
        <DetailHistory
          ref={this.detailRef}
          setItem={this.setItem}
          getData={this.props.getData}
        />
      </div>
    );
  }
}
