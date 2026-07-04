import { CollectionRepository } from '../repositories/collection.repository';
import { ConflictError, NotFoundError } from '../utils/errors';
import { Collection } from '@prisma/client';

const collectionRepository = new CollectionRepository();

export class CollectionService {
  async getCollections(userId: string): Promise<(Collection & { _count: { books: number } })[]> {
    return collectionRepository.findAll(userId);
  }

  async createCollection(userId: string, name: string): Promise<Collection> {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new ConflictError('Collection name cannot be empty');
    }

    const existing = await collectionRepository.findByName(trimmedName, userId);
    if (existing) {
      throw new ConflictError('Collection already exists');
    }

    return collectionRepository.create({
      userId,
      name: trimmedName
    });
  }

  async deleteCollection(id: string, userId: string): Promise<Collection> {
    const col = await collectionRepository.findById(id, userId);
    if (!col) {
      throw new NotFoundError('Collection not found');
    }
    return collectionRepository.delete(id, userId);
  }
}
