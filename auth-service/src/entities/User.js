class User {
  constructor({ id, name, email, passwordHash, role, status, createdAt }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.status = status;
    this.createdAt = createdAt;
  }
}

module.exports = User;
