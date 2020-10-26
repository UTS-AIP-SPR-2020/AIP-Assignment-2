import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Card, Col } from "react-bootstrap";
import PlaceholderImage from "../img/placeholder.png";

class RewardCard extends React.Component {
  constructor(props) {
    super(props);
    this.handleComplete = this.handleComplete.bind(this);

    //this.handleDelete = this.handleDelete.bind(this);*/

  }
  handleComplete(e) {
    this.props.onAccept(e);
  }
  /*  handleInputChange(e) {
      this.props.onInputChange(e);
    }
*/
  /*
      handleDelete(favour){
        this.props.onDelete(favour);
      }
  */

  render() {
    const favour = this.props.favour;
    let imageURL = PlaceholderImage;
    if (favour.imageURL) {
      imageURL = favour.imageURL;
    };

    let cardFooterAccept = <p></p>;
    if (favour != null) {
      return (
        <Col sm={12} md={4} lg={3} className="request-card-container">
          <Card className="request-card">
            <Card.Img variant="top" className="card-img" style={{ backgroundImage: `url(${imageURL})` }} />
            <Card.Body>
              <Card.Title> <h2>{favour.name}</h2> </Card.Title>
              <Card.Text>
                <p> {favour.content} </p>
                {/*<p> Completed by: {favour.debitorName} </p>*/}
                <br></br>
                <br></br>
                <span display="inline">
                  {favour.chocolates !== 0 && favour.chocolates !== null &&
                    (
                      <span><FontAwesomeIcon icon="cookie"></FontAwesomeIcon> x{favour.chocolates}  </span>
                    )}

                  {favour.mints !== 0 && favour.mints !== null &&
                    (
                      <span><FontAwesomeIcon icon="leaf"></FontAwesomeIcon> x{favour.mints}  </span>
                    )}

                  {favour.pizzas !== 0 && favour.pizzas !== null &&
                    (
                      <span><FontAwesomeIcon icon="pizza-slice"></FontAwesomeIcon> x{favour.pizzas}  </span>
                    )}

                  {favour.coffees !== 0 && favour.coffees !== null &&
                    (
                      <span><FontAwesomeIcon icon="coffee"></FontAwesomeIcon> x{favour.coffees}  </span>
                    )}

                  {favour.candies !== 0 && favour.candies !== null &&
                    (
                      <span><FontAwesomeIcon icon="candy-cane"></FontAwesomeIcon> x{favour.candies}  </span>
                    )}
                </span>
              </Card.Text>
            </Card.Body>

            <Card.Footer>
              {cardFooterAccept}

            </Card.Footer>
          </Card>
        </Col>
      );
    }
    else return null;
  }

}

export default RewardCard;

