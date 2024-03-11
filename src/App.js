//import logo from './logo.svg';
import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import Card from './components/ProductCard';
import MD5 from "crypto-js/md5";
import Pagination from 'react-bootstrap/Pagination';
import Form from 'react-bootstrap/Form';


function App() {
  //const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(50);
  const [products, setProducts] = useState([]);
  //const [page, setPage] = useState(2);
  const [pages, setPages] = useState([]);
  const [isSearching, setIsSearching] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const uniqIds = useRef([]);
  const completed = useRef(false);
  const offset = useRef(0);
  const page = useRef(1);
  const lastPage = useRef(1);
  const productNameSearchString = useRef('');
  const productPriceSearchString = useRef('');
  const productBrandSearchString = useRef('');
  const isWaiting = useRef(false);


  let resendRequest = (action, params, handler) => {
    getData(action, params, handler);
  }

  const getData = async (action, params, handler) => {

    let date = new Date();
    let dateStr = date.getFullYear();
    if ((date.getMonth() + 1) < 10) dateStr += '0';
    dateStr += date.getMonth() + 1;
    if (date.getDate() < 10) dateStr += '0';
    dateStr += date.getDate();
    // console.log(dateStr);
    let password = MD5('Valantis_' + dateStr);
    fetch('http://api.valantis.store:40000', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth': password,
      },
      body: JSON.stringify({

        action: action,
        params: params,
      })
    }).then(response => {
      return response.json();
    }).then(data => {
      handler(data)
    }).catch(error => {
      console.error(error);
      resendRequest(action, params, handler);
    });
  }
  const makeUniqArrayProd = (arr) => {
    let ids = [];
    let res = [];
    for (let i = 0; i < arr.length; i++)
      if (!ids.includes(arr[i]['id'])) {
        ids.push(arr[i]['id']);
        res.push(arr[i]);
      }
    return res;
  }


  let printData = (data) => {
    console.log(makeUniqArrayProd(data['result']));
  }

  let setProductsData = (data) => {
    setProducts(makeUniqArrayProd(data['result']));
    setItems();
    setIsSearching(false);
  }

  let pageClick = (n) => {
    if (!isNaN(n)) page.current = n;
    if (n === 'prev' && page.current > 1) page.current--;
    if (n === 'next' && page.current < Math.floor((uniqIds.current.length - 1) / 50) + 1) page.current++;
    if (n === 'last') page.current = Math.floor((uniqIds.current.length - 1) / 50) + 1;
    showProducts();
  }

  let setItems = () => {
    let items = [];
    items.push(<Pagination.First key={0} onClick={() => pageClick(1)} active={false} />);
    if (page.current > 1)
      items.push(<Pagination.Prev onClick={() => pageClick('prev')} />);
    items.push(
      <Pagination.Item key={1} active={1 === page.current} onClick={() => pageClick(1)}>
        {1}
      </Pagination.Item>,
    );
    if (page.current > 4)
      items.push(<Pagination.Ellipsis disabled />);
    let fPage = page.current - 2;
    if (fPage <= 1) fPage = 2;
    for (let i = fPage; i <= page.current; i++)
      items.push(
        <Pagination.Item key={i} active={i === page.current} onClick={() => pageClick(i)}>
          {i}
        </Pagination.Item>,
      );
    let lPage = page.current + 2;
    if (lPage > lastPage.current)
      lPage = lastPage.current;
    for (let i = page.current + 1; i <= lPage; i++)
      items.push(
        <Pagination.Item key={i} active={i === page.current} onClick={() => pageClick(i)}>
          {i}
        </Pagination.Item>,
      );
    if (lPage < lastPage.current - 1)
      items.push(<Pagination.Ellipsis disabled />);
    if (lPage < lastPage.current)
      items.push(
        <Pagination.Item key={lastPage.current} active={lastPage.current === page.current} onClick={() => pageClick(lastPage.current)}>
          {lastPage.current}
        </Pagination.Item>,
      );
    if (page.current < lastPage.current)
      items.push(<Pagination.Next onClick={() => pageClick('next')} />);
    items.push(<Pagination.Last onClick={() => pageClick('last')} />);
    setPages(items);
  }

  let showProducts = () => {
    let ids = uniqIds.current.slice((page.current - 1) * limit, page.current * limit);
    getData('get_items', { "ids": ids }, setProductsData);
  }

  let getProducts = (data) => {
    uniqIds.current = data['result'].filter(function (item, pos) {
      return data['result'].indexOf(item) == pos;
    });
    lastPage.current = Math.floor((uniqIds.current.length - 1) / 50) + 1;
    //setItems();
    showProducts();
  }

  let onProductNameChange = (key) => {
    document.getElementById('product_price').value = '';
    document.getElementById('product_brand').value = '';
    if (key.key == 'Enter') {
      setProducts([]);
      setIsSearching(true);
      let searchString = productNameSearchString.current.value;
      if (searchString != '')
        getData('filter', { "product": searchString }, getProducts);
      else
        getData("get_ids", {}, getProducts);
    }
  }

  let onProductPriceChange = (key) => {
    document.getElementById('product_name').value = '';
    document.getElementById('product_brand').value = '';
    if (key.key == 'Enter') {
      setProducts([]);
      setIsSearching(true);
      let searchString = productPriceSearchString.current.value;
      if (searchString != '') {
        searchString = Number(searchString);
        getData('filter', { "price": searchString }, getProducts);
      }
      else getData("get_ids", {}, getProducts);
    }
  }

  let onProductBrandChange = (key) => {
    //console.log(key.key);
    document.getElementById('product_price').value = '';
    document.getElementById('product_name').value = '';
    if (key.key == 'Enter') {
      setProducts([]);
      setIsSearching(true);
      let searchString = productBrandSearchString.current.value;
      if (searchString != '')
        getData('filter', { "brand": searchString }, getProducts);
      else
        getData("get_ids", {}, getProducts);
    }

  }

  useEffect(() => {
    getData("get_ids", {}, getProducts);
    // getData('filter', {/* "product": "кольцо", */"price": 35000.0 }, getProducts);
  }, []);

  return (
    <div className="App">
      <div className='main_container'>
        <div className='filters_container'>
          <div className='filters_block'>
            <h2>Фильтры:</h2>
            <p>(Введите значение и нажмите Enter)</p>
            <Form>
              <Form.Group className="mb-3" controlId="product_name">
                <Form.Label>Название</Form.Label>
                <Form.Control type="text" ref={productNameSearchString} onKeyDown={(key) => onProductNameChange(key)} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="product_price">
                <Form.Label>Цена</Form.Label>
                <Form.Control type="number" ref={productPriceSearchString} onKeyDown={(key) => onProductPriceChange(key)} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="product_brand">
                <Form.Label>Бренд</Form.Label>
                <Form.Control type="text" ref={productBrandSearchString} onKeyDown={(key) => onProductBrandChange(key)} />
              </Form.Group>
            </Form>
          </div>
        </div>
        <div className='main_info'>
          <div className='page_container'>
            <Pagination size="sm">{pages}</Pagination>
          </div>

          <div className="products_container">
            {isSearching && (
              <div className='searching'>Загрузка...</div>
            )}
            {uniqIds.current.length == 0 && (
              <div className='searching'></div>
            )
            }
            {products.map((item, index) =>
              <Card productId={item['id']} productName={item['product']} productPrice={item['price']} productBrand={item['brand']} index={index} />
            )}
          </div>

          <div className='page_container'>
            <Pagination size="sm">{pages}</Pagination>
          </div>
        </div>

      </div>


    </div>
  );
}

export default App;
