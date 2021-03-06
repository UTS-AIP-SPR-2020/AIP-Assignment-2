import axios from "axios";
import React, { useEffect, useState } from 'react';
import { Row, Spinner } from "react-bootstrap";
import ReactDOM from "react-dom";
import { useParams } from "react-router";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "../../styles/searchRequests.scss";
import RequestCard from "../functionalComponents/request.comp";
import SearchBox from "../shared/SearchBox";
import OperationModal from "../shared/OperationModal";
import "./../../styles/Home.scss";

function SearchRequests(props) {
    const [requests, setRequests] = useState([]);
    const { query } = useParams();
    const [isLoading, setLoading] = useState(true);
    const [resultIndicator, setResultIndicator] = useState(); //"results for..." text
    const [showModal, setShowModal] = useState(false);
    const [status] = useState(200);
    const url = "/request/searchRequest";
    const favourURL = "/favour/acceptRequest";
    const requestURL = "/request/acceptRequest";
    const deleteURL = "/request/delete";

    useEffect(() => {
        if (query) {
            axios
                .post(url, { query })
                .then((response) => {
                    setRequests(response.data);
                })
            setResultIndicator(query);
        }
        setLoading(false);
    }, []);

    if (isLoading) {
        return <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
        </Spinner>;
    }

    //close modal
    function handleClose() {
        setShowModal(false);
    }

    //accept request
    function handleAccept(request) {
        const favour = {
            debitorID: request.ownerID,
            creditorID: localStorage.getItem("userID"),
            creditorName: localStorage.getItem("username"),
            debitorName: request.ownerName,
            name: request.name,
            content: request.content,
            completed: false,
            chocolates: request.chocolates,
            mints: request.mints,
            pizzas: request.pizzas,
            coffees: request.coffees,
            candies: request.candies,
        }

        //convert request to owed favour by creating new favour using request details
        axios
            .post(favourURL, favour)

        //delete request from database so it doesn't show up as a request anymore
        const _id = request._id
        axios
            .post(requestURL, { _id })

        setShowModal(true);
    }

    //delete request
    const handleDelete = (request) => {
        console.log(localStorage.getItem('userID'));
        axios
            .post(deleteURL, {
                requestID: request._id,
                authToken: localStorage.getItem('authToken')
            })
            .then((res) => {
            });

        setShowModal(true);
    }

    return (
        <div>
            <h1> Search requests </h1>
            <p>  Search public requests </p>
            <SearchBox initType="requests"></SearchBox>

            {/* Show when there's a single result */}
            {resultIndicator !== undefined && requests.length === 1 &&
                <div> <p> {requests.length} result for "{resultIndicator}" </p> </div>}

            {/* Show when there's multiple results */}
            {resultIndicator !== undefined && requests.length > 1 &&
                <div> <p> {requests.length} results for "{resultIndicator}" </p> </div>}

            {/* Show when there's no results */}
            {resultIndicator !== undefined && requests.length === 0 &&
                <div> <p> No results for "{resultIndicator}" </p> </div>}

            <Row max-width="100%">
                {requests.map((request) => (<RequestCard request={request} onAccept={() => { handleAccept(request) }} onDelete={() => { handleDelete(request) }}></RequestCard>))}
            </Row>

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

//export default SearchRequests;
export default function App() {
    return (
        <Router>
            <Switch>
                <Route path="/searchrequests/:query" children={<SearchRequests />} />
                <Route path="/searchrequests/" children={<SearchRequests />} />
            </Switch>
        </Router>
    );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);