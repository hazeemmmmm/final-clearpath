import ExperienceService from "./experience.service.js";
import { User } from "../../db/models/user.model.js";
import { logActivity } from "../../utils/analyticsHelper.js";

class ExperienceController {

  //  Create (Admin)
  create = async (req, res, next) => {
    try {
      const data = await ExperienceService.create(req.body);

      res.status(201).json({
        message: "Experience created successfully",
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  // 🔽 Get Filter Options
  getFilterOptions = async (req, res, next) => {
    try {
      const data = await ExperienceService.getFilterOptions();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  //  Get All (Search + Filter + Pagination)
  getAll = async (req, res, next) => {
    try {
      const result = await ExperienceService.getAll(req.query);

      // Track Search Activity
      if (req.query.search || req.query.destination || req.query.type) {
        logActivity({
          userId: req.user?._id || null,
          action: "search",
          category: req.query.type || "general",
          metadata: { searchTerm: req.query.search || req.query.destination || req.query.type }
        });
      }

      res.status(200).json({
        message: "Experiences fetched successfully",
        ...result,
      });
    } catch (err) {
      next(err);
    }
  };

  // 📍 GPS Nearby Discovery
  getNearby = async (req, res, next) => {
    try {
      const { lat, lng, radiusKm = 50 } = req.query;
      if (!lat || !lng) {
        return res.status(400).json({ success: false, message: 'lat and lng query params are required' });
      }
      const result = await ExperienceService.getNearby({
        lat: Number(lat),
        lng: Number(lng),
        radiusKm: Number(radiusKm),
      });
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  };

  //  Get Extensions starting the next day for trip chaining
  getExtensions = async (req, res, next) => {
    try {
      const result = await ExperienceService.getExtensions(req.query);
      res.status(200).json({
        success: true,
        message: "Extension experiences fetched successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  // 🔍 Get One
  getOne = async (req, res, next) => {
    try {
      const data = await ExperienceService.getOne(req.params.id);

      if (!data) {
        return res.status(404).json({
          message: "Experience not found",
        });
      }

      // Track View Package Activity
      logActivity({
        userId: req.user?._id || null,
        action: "view_package",
        packageId: data._id,
        category: data.type || "general",
        destinationId: data.destination?._id || data.destination || null
      });

      res.status(200).json({
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  // Supervisor trips and booking metrics
  getSupervisorTrips = async (req, res, next) => {
    try {
      const trips = await ExperienceService.getBySupervisor(req.user._id);
      res.status(200).json({
        message: "Supervisor trips retrieved successfully",
        trips,
      });
    } catch (err) {
      next(err);
    }
  };

  //  Update (Admin)
  update = async (req, res, next) => {
    try {
      const data = await ExperienceService.update(req.params.id, req.body);

      res.status(200).json({
        message: "Experience updated successfully",
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  //  Delete (Admin)
  delete = async (req, res, next) => {
    try {
      await ExperienceService.delete(req.params.id);

      res.status(200).json({
        message: "Experience deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  };

  // 👯 Duplicate (Admin)
  duplicate = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await ExperienceService.duplicate(id);

      res.status(201).json({
        message: "Experience duplicated successfully",
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  // 🧠 Smart Provider Matching
  getProvidersMatch = async (req, res, next) => {
    try {
      const matches = await ExperienceService.getProvidersMatch(req.params.id);
      res.status(200).json({ success: true, data: matches });
    } catch (err) {
      next(err);
    }
  };

  // 📝 Assign Guide
  assignGuide = async (req, res, next) => {
    try {
      const { providerId } = req.body;
      const data = await ExperienceService.update(req.params.id, { supervisor: providerId });
      res.status(200).json({ success: true, message: "Guide assigned successfully", data });
    } catch (err) {
      next(err);
    }
  };

  // 🌟 Toggle Featured (Admin)
  toggleFeatured = async (req, res, next) => {
    try {
      const { isFeatured } = req.body;
      const data = await ExperienceService.update(req.params.id, { isFeatured });
      res.status(200).json({ success: true, message: "Experience featured status updated", data });
    } catch (err) {
      next(err);
    }
  };

  // 🧠 Optimize Price (AI Rule-based)
  optimizePrice = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { month } = req.query;
      const data = await ExperienceService.optimizePrice(id, month);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  // 🧠 Apply Optimized Price
  applyOptimizedPrice = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { price } = req.body;
      const data = await ExperienceService.applyOptimizedPrice(id, price);
      res.status(200).json({ success: true, message: "Optimized price applied successfully", data });
    } catch (err) {
      next(err);
    }
  };

  // 📝 Auto-Assign Guide Yasmine
  autoAssignGuide = async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Find Yasmine in the database (supervisor/guide role)
      let yasmine = await User.findOne({ 
        role: "supervisor", 
        $or: [
          { firstName: /yasmine/i }, 
          { firstName: /ياسمين/i }
        ] 
      });
      
      if (!yasmine) {
        yasmine = await User.findOne({ role: "supervisor" });
      }
      
      if (!yasmine) {
        // Fallback: Create supervisor Yasmine if she does not exist
        yasmine = await User.create({
          firstName: "Yasmine",
          lastName: "Hamdy",
          email: "yasmine.h@clearpath.com",
          phoneNumber: "+2015555678912",
          role: "supervisor",
          status: "available",
          password: "Password123!"
        });
      }
      
      const data = await ExperienceService.update(id, { supervisor: yasmine._id });
      res.status(200).json({ 
        success: true, 
        message: `Guide Yasmine (${yasmine.firstName} ${yasmine.lastName}) assigned successfully!`, 
        data 
      });
    } catch (err) {
      next(err);
    }
  };
}

export default new ExperienceController();