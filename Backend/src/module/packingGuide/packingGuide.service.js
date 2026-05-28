import { PackingGuide } from '../../db/models/packingguide.model.js';
import { Experience } from '../../db/models/experience.model.js';

class PackingGuideService {

  // ─────────────────────────────────────────────
  // PUBLIC: Smart lookup for a specific experience
  // Priority: experience → destination → activityType → general
  // ─────────────────────────────────────────────
  async getForExperience(experienceId) {
    // 1. Exact match by experience ID
    let guide = await PackingGuide.findOne({ experience: experienceId })
      .populate('experience', 'name')
      .populate('destination', 'name');
    if (guide) return guide;

    // 2. Get the experience to know its destination & type
    const exp = await Experience.findById(experienceId).populate('destination');
    if (!exp) return null;

    const destId = exp.destination?._id || exp.destination;

    // 3. Match by destination
    if (destId) {
      guide = await PackingGuide.findOne({ destination: destId, experience: null })
        .populate('destination', 'name');
      if (guide) return guide;
    }

    // 4. Guess activityType from experience name/description
    const activityType = this._guessActivityType(exp);

    guide = await PackingGuide.findOne({ activityType, experience: null, destination: null });
    if (guide) return guide;

    // 5. Fallback: general guide
    guide = await PackingGuide.findOne({ activityType: 'general' });
    return guide;
  }

  // ─────────────────────────────────────────────
  // ADMIN: Get all guides
  // ─────────────────────────────────────────────
  async getAll(query = {}) {
    const filter = {};
    if (query.activityType) filter.activityType = query.activityType;
    if (query.experience)   filter.experience   = query.experience;
    if (query.destination)  filter.destination  = query.destination;

    return await PackingGuide.find(filter)
      .populate('experience', 'name type')
      .populate('destination', 'name')
      .sort({ createdAt: -1 });
  }

  // ─────────────────────────────────────────────
  // ADMIN: Get one by ID
  // ─────────────────────────────────────────────
  async getOne(id) {
    return await PackingGuide.findById(id)
      .populate('experience', 'name type')
      .populate('destination', 'name');
  }

  // ─────────────────────────────────────────────
  // ADMIN: Create
  // ─────────────────────────────────────────────
  async create(data) {
    // Clean null strings → actual null
    if (!data.experience) data.experience = null;
    if (!data.destination) data.destination = null;
    return await PackingGuide.create(data);
  }

  // ─────────────────────────────────────────────
  // ADMIN: Update
  // ─────────────────────────────────────────────
  async update(id, data) {
    if (!data.experience) data.experience = null;
    if (!data.destination) data.destination = null;
    return await PackingGuide.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate('experience', 'name').populate('destination', 'name');
  }

  // ─────────────────────────────────────────────
  // ADMIN: Delete
  // ─────────────────────────────────────────────
  async delete(id) {
    return await PackingGuide.findByIdAndDelete(id);
  }

  // ─────────────────────────────────────────────
  // Helper: guess activityType from experience name/desc
  // ─────────────────────────────────────────────
  _guessActivityType(exp) {
    const text = `${exp.name || ''} ${exp.description || ''}`.toLowerCase();
    if (text.match(/div|snorkel|coral|reef|scuba|blue hole/)) return 'diving';
    if (text.match(/hik|trek|climb|sinai|mount|trail/)) return 'hiking';
    if (text.match(/desert|safari|camel|bedouin|oasis|dune|sand/)) return 'desert';
    if (text.match(/beach|pool|swim|resort|dayuse|marina|coast/)) return 'beach';
    if (text.match(/yoga|spa|wellness|retreat|relax|meditat/)) return 'wellness';
    if (text.match(/pyramid|museum|temple|pharaoh|historic|culture|tour|cairo/)) return 'cultural';
    if (text.match(/quad|4x4|adventure|extreme|zip|kite|surf|wind/)) return 'adventure';
    return 'general';
  }
}

export default new PackingGuideService();
