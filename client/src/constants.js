// constants.js

const ApplicationStatus = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
};

const ApplicationStatusLabels = {
  [ApplicationStatus.PENDING]: 'Pending',
  [ApplicationStatus.APPROVED]: 'Approved',
  [ApplicationStatus.REJECTED]: 'Rejected',
};

module.exports = {
  ApplicationStatus,
  ApplicationStatusLabels,
};
