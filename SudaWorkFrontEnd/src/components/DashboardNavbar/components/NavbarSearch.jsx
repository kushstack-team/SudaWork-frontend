import React from 'react';
import { FiSearch } from 'react-icons/fi';

export default function NavbarSearch({
  searchQuery,
  setSearchQuery,
  onSubmit,
  placeholder = 'أي خدمة أو مستقل تريد أن تبحث عنه؟'
}) {
  return (
    <div className="topbar-center">
      <form className="dashboard-search-form" onSubmit={onSubmit}>
        <input
          type="text"
          className="dashboard-search-input"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search"
        />
        <button type="submit" className="dashboard-search-btn" aria-label="Search button">
          <FiSearch className="search-icon" />
        </button>
      </form>
    </div>
  );
}
