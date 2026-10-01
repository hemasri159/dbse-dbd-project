import React from 'react';

export default function SearchFilter({ search, setSearch, category, setCategory }) {
  return (
    <div className="card" style={{ display: 'flex', gap: '15px' }}>
      <input
        className="input-field"
        style={{ marginBottom: 0 }}
        placeholder="Search events by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select
        className="input-field"
        style={{ marginBottom: 0, width: '220px' }}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="All">All Categories</option>
        <option value="Technology">Technology</option>
        <option value="Workshops">Workshops</option>
        <option value="Management">Management</option>
      </select>
    </div>
  );
}