import React from 'react';

export default function NavbarCategories({ categories, activeCategory, onCategoryClick }) {
  return (
    <nav className="dashboard-category-nav" aria-label="Categories Navigation">
      <div className="dashboard-category-container">
        <ul className="category-menu-list">
          {categories.map((cat) => (
            <li key={cat.id} className="category-menu-item">
              <button
                type="button"
                className={`category-menu-link ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => onCategoryClick(cat.id)}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
