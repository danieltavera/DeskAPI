class LogEntry {
  constructor({ id, event, userId, message, date }) {
    this.id = id;
    this.event = event;
    this.userId = userId;
    this.message = message;
    this.date = date;
  }
}

module.exports = LogEntry;
