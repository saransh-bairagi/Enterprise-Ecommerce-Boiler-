/**
 * Example repository pattern for a generic entity
 * Use as a template for missing repositories.
 */
class GenericRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id) {
    return this.model.findById(id).lean();
  }

  async findAll(filter = {}, options = {}) {
    return this.model.find(filter, null, options).lean();
  }

  async create(data) {
    const doc = new this.model(data);
    return doc.save();
  }

  async updateById(id, update) {
    return this.model.findByIdAndUpdate(id, update, { new: true });
  }

  async deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }
}

module.exports = GenericRepository;
