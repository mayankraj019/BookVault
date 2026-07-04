import { Response, NextFunction } from 'express';
import { CollectionService } from '../services/collection.service';
import { AuthenticatedRequest } from '../middlewares/auth';

const collectionService = new CollectionService();

export class CollectionController {
  async getCollections(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await collectionService.getCollections(userId);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      return next(err);
    }
  }

  async createCollection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { name } = req.body;
      const result = await collectionService.createCollection(userId, name);
      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      return next(err);
    }
  }

  async deleteCollection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      await collectionService.deleteCollection(id, userId);
      return res.status(200).json({
        success: true,
        message: 'Collection deleted successfully'
      });
    } catch (err) {
      return next(err);
    }
  }
}
