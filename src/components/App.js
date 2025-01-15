import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import '../styles/App.css';
import UserList from './UserList';
import UserForm from './UserForm';
import UserDetails from './UserDetails';

const App = () => {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <h1>User Management System</h1>
          <div className="nav-links">
            <Link to="/">User List</Link>
            <Link to="/create">Create User</Link>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<UserList />} />
            <Route path="/create" element={<UserForm />} />
            <Route path="/edit/:id" element={<UserForm />} />
            <Route path="/user/:id" element={<UserDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;