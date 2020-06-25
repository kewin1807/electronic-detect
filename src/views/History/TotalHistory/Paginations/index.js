import React from "react";
import constants from "../../../../constants";
import { Button } from "react-bootstrap";
import { Row } from "reactstrap";
export default class PaginationHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activePage: 1,
    };
    this.startSnapshot = props.startSnapshot;
    this.endSnapshot = props.endSnapshot;
  }

  queryPaginantionPrev = () => {
    if (this.state.activePage === 1) {
      return;
    }
    this.setState({ activePage: this.state.activePage - 1 });
    // const offset = pageNumber * constants.limitQuery;
    const { firebaseRef, loadingRef, queryWithPagination } = this.props;
    if (loadingRef && loadingRef.current) {
      loadingRef.current.setLoading();
    }
    firebaseRef
      .orderBy("createAt", "desc")
      .endBefore(this.startSnapshot)
      .limitToLast(constants.limitQuery)
      // .offset(offset)
      .get()
      .then((querySnapshots) => {
        // console.log(querySnapshots);
        let history = [];
        querySnapshots.forEach((doc) => {
          const item = doc.data();
          item.id = doc.id;
          history.push(item);
        });
        this.endSnapshot = querySnapshots.docs[querySnapshots.docs.length - 1];
        this.startSnapshot = querySnapshots.docs[0];
        queryWithPagination(history, () => {
          if (loadingRef && loadingRef.current) {
            loadingRef.current.hideLoading();
          }
        });
      })
      .catch((error) => {
        if (loadingRef && loadingRef.current) {
          loadingRef.current.hideLoading();
        }
      });
  };
  queryPaginantionAfter = () => {
    const { firebaseRef, loadingRef, queryWithPagination } = this.props;

    this.setState({ activePage: this.state.activePage + 1 }, () => {
      if (loadingRef && loadingRef.current) {
        loadingRef.current.setLoading();
      }
      firebaseRef
        .orderBy("createAt", "desc")
        .startAfter(this.endSnapshot)
        .limit(constants.limitQuery)

        // .offset(offset)
        .get()
        .then((querySnapshots) => {
          // console.log(querySnapshots);
          let history = [];
          querySnapshots.forEach((doc) => {
            const item = doc.data();
            item.id = doc.id;
            history.push(item);
          });
          this.endSnapshot =
            querySnapshots.docs[querySnapshots.docs.length - 1];
          this.startSnapshot = querySnapshots.docs[0];

          queryWithPagination(history, () => {
            if (loadingRef && loadingRef.current) {
              loadingRef.current.hideLoading();
            }
          });
        })
        .catch((error) => {
          if (loadingRef && loadingRef.current) {
            loadingRef.current.hideLoading();
          }
        });
    });
  };

  render() {
    const { totalItems } = this.props;
    const totalPage = Number(totalItems / constants.limitQuery);
    return (
      <div>
        <Row style={{ alignItems: "flex-end", justifyContent: "center" }}>
          <Button
            variant="success"
            style={{ padding: 20 }}
            onClick={() => {
              this.queryPaginantionPrev();
            }}
          >
            Prev
          </Button>
          {this.state.activePage < totalPage ? (
            <Button
              variant="success"
              style={{ padding: 20 }}
              onClick={() => {
                this.queryPaginantionAfter();
              }}
            >
              Next
            </Button>
          ) : null}
        </Row>
      </div>
      // <Pagination
      //   activePage={this.state.activePage}
      //   itemsCountPerPage={constants.limitQuery}
      //   totalItemsCount={totalItems}
      //   pageRangeDisplayed={5}
      //   onChange={this.queryPaginantion}
      // />
    );
  }
}
