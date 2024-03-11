import React from "react";
import '../App.css';
import Card from 'react-bootstrap/Card';

export default function ProductCard(props) {
    const { productId, productName, productPrice, productBrand, index } = props;

    return (<>
        <Card style={{ width: '480px' }} className="mb-2 card_wrapper" bg="light" border="primary">
            <Card.Img variant="top" src="../img/img_example.png" />
            <Card.Body>
                <Card.Title>{productName}</Card.Title>
                <Card.Subtitle>Брэнд: <b>{productBrand}</b></Card.Subtitle>
                <Card.Text><b>Цена:</b> {productPrice} руб.</Card.Text>
                <Card.Text>{productId}</Card.Text>
            </Card.Body>
        </Card>
    </>);

    //  return (<>
    //         <div className="card_wrapper" key={index}>
    //             <p><b>ID: </b>{productId}</p>
    //             <h2>Название: {productName}</h2>
    //             <p><b>Цена: </b>{productPrice}</p>
    //             <p><b>Брэнд: </b>{productBrand}</p>
    //         </div>

    //     </>)

}