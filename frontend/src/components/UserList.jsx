// src/components/UserList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from './Alert';
import '../styles/UserList.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchUsers = async (name = '') => {
    setLoading(true);
    try {
      const url = name 
        ? `http://localhost:8080/users/search?name=${encodeURIComponent(name)}`
        : 'http://localhost:8080/users';
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 404) {
          setUsers([]);
          setSearched(true);
        } else {
          throw new Error(data.description || 'Failed to fetch users');
        }
      } else {
        setUsers(data.data || []);
        setSearched(name !== '');
      }
    } catch (error) {
      if (error.message !== 'User not found') {
        setAlert({
          type: 'error',
          message: error.message
        });
      }
      setUsers([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(searchName);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`http://localhost:8080/users/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.description || 'Failed to delete user');
      }

      setAlert({
        type: 'success',
        message: 'User deleted successfully'
      });
      fetchUsers(searchName); // Maintain search results after deletion
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message
      });
    }
  };

  return (
    <div className="user-list">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <button type="submit">Search</button>
        {searchName && (
          <button 
            type="button" 
            className="clear-search"
            onClick={() => {
              setSearchName('');
              setSearched(false);
              fetchUsers('');
            }}
          >
            Clear Search
          </button>
        )}
      </form>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : users.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.age}</td>
                <td>{user.address}</td>
                <td>{user.phoneNumber}</td>
                <td className="actions">
                  <Link to={`/user/${user.id}`} className="btn view">View</Link>
                  <Link to={`/edit/${user.id}`} className="btn edit">Edit</Link>
                  <button onClick={() => handleDelete(user.id)} className="btn delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-users">
          {searched 
            ? `No users found${searchName ? ` with name "${searchName}"` : ''}`
            : 'No users available'}
        </p>
      )}
    </div>
  );
};

export default UserList;