class Booking {
  constructor({ id, userId, resourceId, startTime, endTime, status, createdAt }) {
    this.id = id;
    this.userId = userId;
    this.resourceId = resourceId;
    this.startTime = startTime;
    this.endTime = endTime;
    this.status = status;
    this.createdAt = createdAt;
  }
}

module.exports = Booking;
