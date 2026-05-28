import packingGuideService from './packingGuide.service.js';

class PackingGuideController {

  // GET /packing-guide/for/:experienceId  (public)
  getForExperience = async (req, res, next) => {
    try {
      const guide = await packingGuideService.getForExperience(req.params.experienceId);
      if (!guide) {
        return res.status(404).json({ success: false, message: 'No packing guide found for this experience.' });
      }
      res.json({ success: true, data: guide });
    } catch (err) { next(err); }
  };

  // GET /packing-guide  (admin)
  getAll = async (req, res, next) => {
    try {
      const guides = await packingGuideService.getAll(req.query);
      res.json({ success: true, count: guides.length, data: guides });
    } catch (err) { next(err); }
  };

  // GET /packing-guide/:id  (admin)
  getOne = async (req, res, next) => {
    try {
      const guide = await packingGuideService.getOne(req.params.id);
      if (!guide) return res.status(404).json({ success: false, message: 'Guide not found.' });
      res.json({ success: true, data: guide });
    } catch (err) { next(err); }
  };

  // POST /packing-guide  (admin)
  create = async (req, res, next) => {
    try {
      const guide = await packingGuideService.create(req.body);
      res.status(201).json({ success: true, message: 'Packing guide created successfully.', data: guide });
    } catch (err) { next(err); }
  };

  // PATCH /packing-guide/:id  (admin)
  update = async (req, res, next) => {
    try {
      const guide = await packingGuideService.update(req.params.id, req.body);
      if (!guide) return res.status(404).json({ success: false, message: 'Guide not found.' });
      res.json({ success: true, message: 'Packing guide updated successfully.', data: guide });
    } catch (err) { next(err); }
  };

  // DELETE /packing-guide/:id  (admin)
  delete = async (req, res, next) => {
    try {
      const guide = await packingGuideService.delete(req.params.id);
      if (!guide) return res.status(404).json({ success: false, message: 'Guide not found.' });
      res.json({ success: true, message: 'Packing guide deleted successfully.' });
    } catch (err) { next(err); }
  };
}

export default new PackingGuideController();
