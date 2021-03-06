import axios from "axios";
import React, { useEffect, useState } from 'react';
import { Card, Row, Alert } from "react-bootstrap";
import "./../../styles/Home.scss";
import "./../../styles/Profile.scss";
import RequestCard from "../functionalComponents/request.comp";
import OwingFavourCard from "../shared/OwingFavourCard";
import CompletedCard from "../shared/CompletedCard";
import OwedFavourCard from "../shared/OwedFavourCard";
import { Redirect } from "react-router-dom";
import io from 'socket.io-client';
import OperationModal from "../shared/OperationModal";
var socket = null;


function Profile(props) {
  const [owed, setOwed] = useState([]);
  const [owing, setOwing] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [users, setUsers] = useState([])
  const [completed, setCompleted] = useState([])
  const [userID] = useState(localStorage.getItem('userID'))
  const [token] = useState(localStorage.getItem('authToken'))
  const [showModal, setShowModal] = useState(false);
  const [status] = useState(200);

  const requestURL = "/request/myRequests"
  const owedURL = "/favour/myOwedFavours";
  const owingURL = "/favour/myOwingFavours";
  const completedURL = "/favour/myCompletedFavours";
  const findUserURL = "/user/findUserByID"
  const completeFavourURL = "/favour/complete";
  const userAddScoreURL = "/Lists/addScore";
  const deleteURL = "/request/delete";

  useEffect(() => {
    socket = io({
      query: {
        token: token,
      }
    }
    );
    //find requests
    axios
      .post(requestURL, { token })
      .then((response) => {
        //setMyRequests(response.data)
        setMyRequests(response.data);
      });
    //find owed favours (favours others owed you)
    axios
      .post(owedURL, { token })
      .then((response) => {
        setOwed(response.data)
      });
    //find owing favours (favours you owe to others)
    axios
      .post(owingURL, { token })
      .then((response) => {
        setOwing(response.data)
      });
    //find completed favours
    axios
      .post(completedURL, { token })
      .then((response) => {
        setCompleted(response.data)
      });
    //find currently loggedin user
    axios
      .post(findUserURL, { userID })
      .then((response) => {
        setUsers(response.data)
      });
  }, []);


  useEffect(() => {
    socket.on('addFavour', favour => {
      let section = determineFavourSection(favour);
      if (section) {
        section[1](section[0].concat(favour));
      }
    });
    socket.on('deleteFavour', favour => {
      let section = determineFavourSection(favour);
      if (section) {
        let newSection = section[0];
        let i = newSection.length;
        while (i--) {
          if (section[0][i]._id === favour._id) {
            newSection.splice(i, 1);
          }
        }
        section[1](newSection);
      };
    });

    //Handle deleted request
    socket.on("deleteRequest", requestID => {
      let newRequests = myRequests;
      let i = newRequests.length;
      while (i--) {
        if (myRequests[i]._id === requestID) {
          newRequests.splice(i, 1);
        }
      }
      setMyRequests(newRequests);
    });
    socket.on("addRequest", newRequest => {
      setMyRequests(myRequests.concat(newRequest));
    })
  });

  //Find appropriate section for favour
  function determineFavourSection(favour) {
    if (favour.creditorID === userID && favour.completed === false) {
      return ([owed, setOwed]);
    }
    if (favour.debitorID === userID && favour.completed === false) {
      return ([owing, setOwing]);
    }
    if (favour.debitorID === userID && favour.completed === true) {
      return ([completed, setCompleted]);
    }
    return;
  }


  //delete unwanted requests
  const handleDelete = (request) => {
    console.log(localStorage.getItem('userID'));
    axios
      .post(deleteURL, {
        requestID: request._id,
        authToken: localStorage.getItem('authToken')
      });
    setShowModal(true);
  }

  //turn favour to completed status
  function handleComplete(favour) {
    axios
      .post(completeFavourURL, favour);
    axios
      .post(userAddScoreURL, { userID });
    setShowModal(true);
  }

  //close modal
  function handleClose() {
    setShowModal(false);
  }

  //redirect user if user is not logged in
  if (localStorage.getItem("loggedIn") === "false" || localStorage.getItem("loggedIn") === null || localStorage.getItem("loggedIn") === false) {
    return <Redirect to="/login" />;
  }

  return (
    <div class="center">
      <Card className="profileCard">

        {/* User Information */}
        <Card.Header as="h5" > <h1>{localStorage.getItem('username')}</h1></Card.Header>
        <Card.Body>
          <p> Score: {users.score} </p>
          <p> Requests: {myRequests.length} </p> {/* Requests you've made */}
          <p> Owing favours: {owed.length} </p> {/* Favours you owe others */}
          <p> Owed favours: {owing.length} </p> {/* Favours you are owed by others */}
          <p> Completed: {completed.length} </p> {/* Favours others used to owe you but have completed */}
        </Card.Body>
      </Card>

      {/* Requests */}
      <h2> Requests ({myRequests.length})  </h2>
      <p>  Public requests you've made </p>
      <Row max-width="100%"> {myRequests.map((request) => (<RequestCard request={request} onAccept={() => { handleComplete(request) }} onDelete={() => { handleDelete(request) }}></RequestCard>))} </Row>
      {myRequests.length === 0 &&
        <Alert id="emptyInfo" variant="info" className="profileAlert" role="alert">
          No requests! Create a request to see something here
        </Alert>}

      {/* Owing Favours */}
      <h2> Owing favours ({owed.length}) </h2>
      <p>  Favours that you owe others </p>
      <Row max-width="100%"> {owed.map((favour) => (<OwingFavourCard favour={favour} onAccept={() => { handleComplete(favour) }}></OwingFavourCard>))} </Row>
      {owed.length === 0 &&
        <Alert id="emptyInfo" variant="info" className="profileAlert" role="alert">
          No owing favours! Create an owing favour to see something here
         </Alert>}

      {/* Owed Favours */}
      <h2> Owed Favours ({owing.length}) </h2>
      <p>  Favours that others owe you  </p>
      <Row max-width="100%"> {owing.map((favour) => (<OwedFavourCard favour={favour} onAccept={() => { handleComplete(favour) }}></OwedFavourCard>))} </Row>
      {owing.length === 0 &&
        <Alert id="emptyInfo" variant="info" className="profileAlert" role="alert">
          No owed favours! Accept requests or create an owed favour to see something here
        </Alert>}

      {/* Completed Favours */}
      <h2> Completed ({completed.length}) </h2>
      <p>  Favours that others owed you and have completed  </p>
      <Row max-width="100%"> {completed.map((favour) => (<CompletedCard favour={favour} onAccept={() => { handleComplete(favour) }}></CompletedCard>))} </Row>
      {completed.length === 0 &&
        <Alert id="emptyInfo" variant="info" className="profileAlert" role="alert">
          No completed favours! Start accepting and completing requests to see something here!
        </Alert>}


      {/* Modal */}
      <OperationModal
        status={status}
        show={showModal}
        onHandleClose={() => {
          handleClose();
        }}
      ></OperationModal>
    </div>
  );
}

export default Profile;

