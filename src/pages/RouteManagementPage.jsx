// src/pages/RouteManagementPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Table, Modal, Alert } from 'react-bootstrap';

export default function RouteManagementPage() {
    const [routes, setRoutes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentRoute, setCurrentRoute] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRoutes();
    }, []);

    // --- IMPROVED DATA FETCHING AND ERROR HANDLING ---
    const fetchRoutes = async () => {
        try {
            // IMPORTANT: Replace this with your actual live Render backend URL
            const response = await axios.get('https://my-bus-planner-api.onrender.com/api/routes');
            
            // This check ensures we only try to update the state if the API returns a valid array.
            if (Array.isArray(response.data)) {
                setRoutes(response.data);
            } else {
                console.error("API did not return an array:", response.data);
                setRoutes([]); // Set to an empty array to prevent crashes
            }
        } catch (err) {
            setError('Failed to fetch routes from the server. The backend may be starting up.');
            console.error("Fetch Routes Error:", err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentRoute(prevState => ({ ...prevState, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const payload = { ...currentRoute };
        if (!payload.turnoutFromDepot) {
            payload.firstStop = '';
            payload.upTurnoutKm = 0;
            payload.downTurnoutKm = 0;
        }
        // IMPORTANT: Replace this with your actual live Render backend URL
        const API_BASE_URL = 'https://my-bus-planner-api.onrender.com/api/routes';
        const method = isEditing ? 'put' : 'post';
        const url = isEditing ? `${API_BASE_URL}/${payload._id}` : API_BASE_URL;
        try {
            await axios[method](url, payload);
            fetchRoutes();
            handleCloseModal();
        } catch (err) {
            setError('Failed to save the route.');
        }
    };

    const handleEdit = (route) => {
        const routeToEdit = { ...route, firstStop: route.firstStop || '', upTurnoutKm: route.upTurnoutKm || 0, downTurnoutKm: route.downTurnoutKm || 0 };
        setCurrentRoute(routeToEdit);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                 // IMPORTANT: Replace this with your actual live Render backend URL
                await axios.delete(`https://my-bus-planner-api.onrender.com/api/routes/${id}`);
                fetchRoutes();
            } catch (err) {
                setError('Failed to delete.');
            }
        }
    };

    const handleAddNew = () => {
        setCurrentRoute({
            routeNumber: '', from: '', to: '', routeName: '',
            upTurnoutKm: 0, downTurnoutKm: 0, upregularKm: 0, downregularKm: 0,
            timePerKm: 0, turnoutFromDepot: false, firstStop: ''
        });
        setIsEditing(false);
        setShowModal(true);
    };

    const handleCloseModal = () => { setShowModal(false); setError(''); };

    return (
        <Container className="my-4">
            <div className="d-flex justify-content-between align-items-center mb-4"><h1>Manage Routes</h1><Button variant="primary" onClick={handleAddNew}>+ Add New Route</Button></div>
            <Card className="shadow-sm">
                <Card.Header as="h5" className="fw-bold">Existing Routes</Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
                    <Table responsive striped bordered hover>
                        <thead><tr><th>Route No.</th><th>From</th><th>To</th><th>Name</th><th>Actions</th></tr></thead>
                        <tbody>
                            {/* THIS IS THE "GUARD CLAUSE" FIX */}
                            {Array.isArray(routes) && routes.map(route => (
                                <tr key={route._id}>
                                    <td>{route.routeNumber}</td>
                                    <td>{route.from}</td>
                                    <td>{route.to}</td>
                                    <td>{route.routeName}</td>
                                    <td>
                                        <Button variant="outline-secondary" size="sm" onClick={() => handleEdit(route)}>Edit</Button>{' '}
                                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(route._id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton><Modal.Title>{isEditing ? 'Edit Route' : 'Add New Route'}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleFormSubmit}>
                        {/* Form structure remains the same */}
                        <Row>
                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Route Number</Form.Label><Form.Control type="text" name="routeNumber" value={currentRoute.routeNumber || ''} onChange={handleInputChange} required /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Route Name</Form.Label><Form.Control type="text" name="routeName" value={currentRoute.routeName || ''} onChange={handleInputChange} required /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Label>From</Form.Label><Form.Control type="text" name="from" value={currentRoute.from || ''} onChange={handleInputChange} required /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Label>To</Form.Label><Form.Control type="text" name="to" value={currentRoute.to || ''} onChange={handleInputChange} required /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Up Regular Km</Form.Label><Form.Control type="number" name="upregularKm" value={currentRoute.upregularKm || 0} onChange={handleInputChange} required /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Down Regular Km</Form.Label><Form.Control type="number" name="downregularKm" value={currentRoute.downregularKm || 0} onChange={handleInputChange} required /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Time Per Km (mins)</Form.Label><Form.Control type="number" step="any" name="timePerKm" value={currentRoute.timePerKm || 0} onChange={handleInputChange} required /></Form.Group></Col>
                            <Col md={6} className="d-flex align-items-center"><Form.Group className="form-check"><Form.Check type="checkbox" name="turnoutFromDepot" label="Turnout from Depot?" checked={currentRoute.turnoutFromDepot || false} onChange={handleInputChange} /></Form.Group></Col>
                        </Row>
                        
                        {currentRoute.turnoutFromDepot && (
                            <Row className="mt-3 p-3 border rounded bg-light">
                                <Col md={4}><Form.Group className="mb-3"><Form.Label>First Stop</Form.Label><Form.Control type="text" name="firstStop" value={currentRoute.firstStop || ''} onChange={handleInputChange} placeholder="Name of first stop" /></Form.Group></Col>
                                <Col md={4}><Form.Group className="mb-3"><Form.Label>Up Turnout Km</Form.Label><Form.Control type="number" step="any" name="upTurnoutKm" value={currentRoute.upTurnoutKm || 0} onChange={handleInputChange} /></Form.Group></Col>
                                <Col md={4}><Form.Group className="mb-3"><Form.Label>Down Turnout Km</Form.Label><Form.Control type="number" step="any" name="downTurnoutKm" value={currentRoute.downTurnoutKm || 0} onChange={handleInputChange} /></Form.Group></Col>
                            </Row>
                        )}
                        
                        <div className="mt-4">
                            <Button variant="secondary" onClick={handleCloseModal} className="me-2">Cancel</Button>
                            <Button variant="primary" type="submit">Save Route</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
}
