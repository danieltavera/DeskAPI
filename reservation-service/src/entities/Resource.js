class Resource {
  constructor({ id, name, description, typeId, typeName, location, stateCode, status, attributes, createdBy, createdAt }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.typeId = typeId;
    this.type = typeName; // frontend expects a plain "type" string, not a nested object
    this.location = location;
    this.stateCode = stateCode; // Australian subdivision code (e.g. AU-VIC), used for regional holiday checks
    this.status = status;
    this.attributes = attributes;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
  }
}

module.exports = Resource;
