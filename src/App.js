import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Card, Modal, Pagination, Button, Spinner } from 'react-bootstrap';
import './style.scss';

const BASE_URL = 'https://api.harvardartmuseums.org';
const API_KEY = 'apikey=f8fef1af-82b1-4677-8e63-5fb78d226795';

// Состояния для хранения данных объектов искусства и фильтров
const App = () => {
  const [artObjects, setArtObjects] = useState([]);
  const [filters, setFilters] = useState({
    classification: '',
    century: '',
    culture: ''
  });
    // Состояния для хранения доступных опций фильтров
  const [filterOptions, setFilterOptions] = useState({
    classifications: [],
    centuries: [],
    cultures: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedObject, setSelectedObject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilterOptions();
    fetchArtObjects();
  }, [page, filters, searchQuery]);
    
  // Функция для получения опций фильтров с API
  const fetchFilterOptions = async () => {
    const classifications = await fetch(`${BASE_URL}/classification?${API_KEY}`).then(res => res.json());
    const centuries = await fetch(`${BASE_URL}/century?${API_KEY}`).then(res => res.json());
    const cultures = await fetch(`${BASE_URL}/culture?${API_KEY}`).then(res => res.json());

    setFilterOptions({
      classifications: classifications.records,
      centuries: centuries.records,
      cultures: cultures.records
    });
  };

    
  // Функция для получения объектов искусства с учетом фильтров и страницы
  const fetchArtObjects = async () => {
    setLoading(true);
    const filterParams = Object.entries(filters)
      .map(([key, value]) => value ? `${key}=${encodeURIComponent(value)}` : '')
      .filter(Boolean)
      .join('&');
    const searchParam = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : '';
    const response = await fetch(`${BASE_URL}/object?${API_KEY}&${filterParams}&page=${page}&size=12${searchParam}`);
    const data = await response.json();
    setArtObjects(data.records);
    setTotalPages(Math.ceil(data.info.totalrecords / 12));
    setLoading(false);
  };

   // Обработчик изменения фильтров
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value
    }));
    setPage(1); // Сброс на первую страницу при изменении фильтров
  };


  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); 
  };

  const handleShowDetails = (artObject) => {
    setSelectedObject(artObject);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedObject(null);
  };

  const renderPagination = () => {
    const maxPageNumbers = 10;
    const startPage = Math.max(1, page - Math.floor(maxPageNumbers / 2));
    const endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);

    let paginationItems = [];
    for (let number = startPage; number <= endPage; number++) {
      paginationItems.push(
        <Pagination.Item key={number} active={number === page} onClick={() => setPage(number)}>
          {number}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className="justify-content-center mt-4">
        <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
        <Pagination.Prev onClick={() => setPage(page - 1)} disabled={page === 1} />
        {paginationItems}
        <Pagination.Next onClick={() => setPage(page + 1)} disabled={page === totalPages} />
        <Pagination.Last onClick={() => setPage(totalPages)} disabled={page === totalPages} />
      </Pagination>
    );
  };

  return (
    <Container fluid>
      <Row className="justify-content-center mb-4">
        <Col md={9} className="text-center">
          <h1>Virtual Art Gallery</h1>
          <Form.Group controlId="searchQuery">
            <Form.Control
              type="text"
              placeholder="Search by title, date, author, etc."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={3}>
          <h3>Filters</h3>
          <p>Please select one option per filter</p>
          <Form>
            <Form.Group controlId="classification" className="mb-3">
              <Form.Label>Classification</Form.Label>
              <Form.Control
                as="select"
                name="classification"
                value={filters.classification}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                {filterOptions.classifications.map(option => (
                  <option key={option.id} value={option.name}>{option.name}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="century" className="mb-3">
              <Form.Label>Century</Form.Label>
              <Form.Control
                as="select"
                name="century"
                value={filters.century}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                {filterOptions.centuries.map(option => (
                  <option key={option.id} value={option.name}>{option.name}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="culture" className="mb-3">
              <Form.Label>Culture</Form.Label>
              <Form.Control
                as="select"
                name="culture"
                value={filters.culture}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                {filterOptions.cultures.map(option => (
                  <option key={option.id} value={option.name}>{option.name}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Col>
        <Col md={9}>
          {loading ? (
            <Spinner animation="border" />
          ) : (
            <>
              <Row>
                {artObjects.length === 0 ? (
                  <Col>
                    <h4>No results found.</h4>
                  </Col>
                ) : (
                  artObjects.map((artObject) => (
                    <Col md={4} key={artObject.id} className="d-flex align-items-stretch">
                      <Card className="mb-4 w-100">
                        {artObject.primaryimageurl && (
                          <Card.Img
                            variant="top"
                            src={artObject.primaryimageurl}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <Card.Body className="d-flex flex-column">
                          <Card.Title>{artObject.title || 'No title'}</Card.Title>
                          <Card.Text>{artObject.dated || 'No date'}</Card.Text>
                          <Button variant="info" onClick={() => handleShowDetails(artObject)} className="mt-auto align-self-start">More Details</Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                )}
              </Row>
              <Row>
                <Col className="d-flex justify-content-center mt-4">
                  {renderPagination()}
                </Col>
              </Row>
            </>
          )}
        </Col>
      </Row>

      {selectedObject && (
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{selectedObject.title || 'No title'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><strong>Title:</strong> {selectedObject.title || 'No title'}</p>
            <p><strong>Artist:</strong> {selectedObject.people?.[0]?.name || 'Unknown'}</p>
            <p><strong>Date:</strong> {selectedObject.dated || 'No date'}</p>
            <p><strong>Description:</strong> {selectedObject.description || 'No description'}</p>
            {selectedObject.primaryimageurl && <img src={selectedObject.primaryimageurl} alt={selectedObject.title} style={{ width: '100%' }} />}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" href={selectedObject.url} target="_blank">View on Harvard Art Museums</Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default App;
