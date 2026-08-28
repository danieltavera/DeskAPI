class Resource {
  constructor({ id, name, description, typeId, typeName, location, status, attributes, createdBy, createdAt }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.typeId = typeId;
    this.type = typeName; // frontend expects a plain "type" string, not a nested object
    this.location = location;
    this.status = status;
    this.attributes = attributes;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
  }
}

module.exports = Resource;
