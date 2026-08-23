import React from 'react';
import './RoleCard.css';

/**
 * RoleCard - A modular, accessible card component for role selection.
 *
 * @param {Object} props
 * @param {string} props.id - Unique identifier for the card
 * @param {string} props.titleLine1 - First line of the card description
 * @param {string} props.titleLine2 - Second line of the card description
 * @param {React.ReactNode} props.icon - Icon element rendered inside the mint circle
 * @param {boolean} props.selected - Whether this card is currently selected
 * @param {Function} props.onClick - Click handler
 * @param {string} [props.roleValue] - The value identifier for this role
 */
const RoleCard = ({
  id,
  titleLine1,
  titleLine2,
  icon,
  selected = false,
  onClick,
  roleValue,
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      id={id}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      className={`role-card ${selected ? 'role-card--selected' : ''}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      data-role={roleValue}
    >
      <div className="role-card__icon-wrapper">
        <div className="role-card__icon-circle">
          {icon}
        </div>
      </div>
      
      <div className="role-card__content">
        <h3 className="role-card__title">
          <span>{titleLine1}</span>
          <span>{titleLine2}</span>
        </h3>
      </div>

      {selected && <div className="role-card__selected-indicator" aria-hidden="true" />}
    </div>
  );
};

export default RoleCard;
