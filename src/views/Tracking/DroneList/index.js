import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Table,
  Row,
  Col,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import { Button } from "react-bootstrap";
import Map from "../../Map";
class DroneList extends React.Component {
  state = {
    isOpen: false,
    drones: [
      { branch: "China", battery: "3000mAH", support: "Bluetooth 5.0" },
      { branch: "Vietnam", battery: "3000mAH", support: "Bluetooth 5.0" },
      { branch: "England", battery: "3000mAH", support: "Bluetooth 5.0" },
      { branch: "US", battery: "3000mAH", support: "Bluetooth 5.0" },
      { branch: "Laos", battery: "3000mAH", support: "Bluetooth 5.0" },
    ],
  };

  setModalOpen = () => {
    this.setState({ isOpen: true });
  };
  setOpenClose = (callback) => {
    this.setState({ isOpen: false }, callback());
  };
  toggle = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };
  render() {
    const { isOpen } = this.state;
    return (
      <Modal isOpen={isOpen} toggle={this.toggle} className="modal-lg">
        <ModalHeader>Drone List</ModalHeader>
        <ModalBody>
          <Map />
          <Table responsive>
            <thead className="text-primary">
              <tr>
                <th>Branch</th>
                <th>Battery</th>
                <th>Support</th>
                <th>Connect</th>
              </tr>
            </thead>
            <tbody>
              {this.state.drones.map((item, index) => {
                return (
                  <tr>
                    <td>{item.branch}</td>
                    <td>{item.battery}</td>
                    <td>{item.support}</td>
                    <td>
                      <Button
                        variant="success"
                        onClick={() => {
                          const { checkVideo } = this.props;
                          if (checkVideo) {
                            this.setOpenClose(checkVideo);
                          }
                        }}
                      >
                        Connect
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </ModalBody>
      </Modal>
    );
  }
}

export default DroneList;
