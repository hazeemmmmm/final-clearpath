import { Activity } from "../../db/models/Activity.model.js";

class ActivityService {
  // Create Activity
  async create(data) {
    return await Activity.create(data);
  }

  // Get All Activities (search + filters)
  async getAll(query) {
    const { search, type, destination, provider, price } = query;

    let filter = {};

    // Search by name
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Filters
    if (type) filter.type = type;
    if (destination) filter.destination = destination;
    if (provider) filter.provider = provider;

    if (price) {
      filter.price = Number(price);
    }

    return await Activity.find(filter)
      .populate("destination")
      .populate("provider");
  }

  // Get One Activity
  async getOne(id) {
    return await Activity.findById(id)
      .populate("destination")
      .populate("provider");
  }

  // Update Activity
  async update(id, data) {
    return await Activity.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  // Delete Activity
  async delete(id) {
    return await Activity.findByIdAndDelete(id);
  }
  // Get Activity Schema Paths dynamically
  getSchema() {
    const schemaFields = [];
    Object.keys(Activity.schema.paths).forEach(path => {
      if (['_id', '__v', 'createdAt', 'updatedAt'].includes(path)) return;
      const field = Activity.schema.paths[path];
      schemaFields.push({
        name: path,
        instance: field.instance, // e.g. "String", "Number", "Boolean", "ObjectID"
        required: !!field.isRequired,
        enumValues: field.enumValues || [],
        ref: field.options.ref || null
      });
    });
    return schemaFields;
  }
}

export default new ActivityService();