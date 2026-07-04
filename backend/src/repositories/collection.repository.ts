import { prisma } from '../config/db';
import { Collection, Prisma } from '@prisma/client';

export class CollectionRepository {
  async findAll(userId: string): Promise<(Collection & { _count: { books: number } })[]> {
    return prisma.collection.findMany({
      where: { userId },
      include: {
        _count: {
          select: { books: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async findById(id: string, userId: string): Promise<Collection | null> {
    return prisma.collection.findFirst({ where: { id, userId } });
  }

  async findByName(name: string, userId: string): Promise<Collection | null> {
    return prisma.collection.findFirst({ where: { name, userId } });
  }

  async create(data: Prisma.CollectionUncheckedCreateInput): Promise<Collection> {
    return prisma.collection.create({ data });
  }

  async delete(id: string, userId: string): Promise<Collection> {
    return prisma.collection.delete({ where: { id, userId } });
  }
}
