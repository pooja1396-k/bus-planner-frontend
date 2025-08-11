// src/pages/HomePage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Card, Row, Col, Alert, ListGroup } from 'react-bootstrap';

export default function HomePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [routes, setRoutes] = useState([]);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false); // To know if a search has been performed

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        setSearched(true); // Mark that a search was attempted
        try {
            // IMPORTANT: Replace this with your actual live Render backend URL
            const API_SEARCH_URL = 'https://your-bus-planner-api.onrender.com/api/routes/search';
            
            const response = await axios.get(API_SEARCH_URL, { params: { search: searchTerm } });

            // This check ensures we only try to update the state if the API returns a valid array.
            if (Array.isArray(response.data)) {
                setRoutes(response.data);
            } else {
                console.error("API did not return an array:", response.data);
                setRoutes([]); // Set to an empty array to prevent crashes
            }

        } catch (err) {
            setError('Failed to fetch search results. The backend may be starting up.');
            console.error("Search Error:", err);
            setRoutes([]); // Clear previous results on error
        }
    };

    return (
        <Container className="my-4">
            <Card className="shadow-sm p-4 text-center">
                <Card.Body>
                    <Card.Title as="h1" className="mb-3">Bus Route Planner</Card.Title>
                    <Card.Text className="mb-4">
                        Find bus routes quickly and easily. Enter a route number, start point, or destination.
                    </Card.Text>
                    <Form onSubmit={handleSearch}>
                        <Row className="justify-content-center">
                            <Col md={8} lg={6}>
                                <Form.Group className="d-flex">
                                    <Form.Control
                                        type="text"
                                        placeholder="Search for a route..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="me-2"
                                    />
                                    <Button variant="primary" type="submit">Search</Button>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            {error && <Alert variant="danger" className="mt-4">{error}</Alert>}

            {searched && (
                <Card className="mt-4">
                    <Card.Header as="h5">Search Results</Card.Header>
                    <Card.Body>
                        <ListGroup variant="flush">
                            {/* THIS IS THE "GUARD CLAUSE" FIX */}
                            {Array.isArray(routes) && routes.length > 0 ? (
                                routes.map(route => (
                                    <ListGroup.Item key={route._id}>
                                        <strong>Route {route.routeNumber}:</strong> {route.from} to {route.to} ({route.routeName})
                                    </ListGroup.Item>
                                ))
                            ) : (
                                <ListGroup.Item>No routes found matching your search term.</ListGroup.Item>
                            )}
                        </ListGroup>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
}
