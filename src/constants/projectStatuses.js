// Mirrors PROJECT_STATUS in the backend (src/modules/projects/projects.constants.js).
// New projects start in PENDING_REVIEW and are published (OPEN) once an admin approves them.
export const PROJECT_STATUS = Object.freeze({
  PENDING_REVIEW: 'Pending Review',
  REJECTED: 'Rejected',
  OPEN: 'Open',
  AWAITING_PAYMENT: 'Awaiting Payment',
  IN_PROGRESS: 'In Progress',
  SUBMITTED: 'Submitted',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
});

// Display statuses in which the owner can still edit, delete or close the project.
export const CLIENT_MANAGEABLE_PROJECT_STATUSES = Object.freeze([
  PROJECT_STATUS.PENDING_REVIEW,
  PROJECT_STATUS.REJECTED,
  PROJECT_STATUS.OPEN,
]);
