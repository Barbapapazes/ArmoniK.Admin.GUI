import { Pagination } from '@armonik.admin.gui/armonik-typing';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationService } from '../../core';
import { Session, SessionDocument } from './schemas';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
    private readonly paginationService: PaginationService
  ) {}

  /**
   * Get all sessions from the database using pagination and filters
   *
   * @param page Page number
   * @param limit Number of items per page
   * @param sessionId Id of the session
   *
   * @returns Pagination of sessions
   */
  async findAllPaginated(
    page: number,
    limit: number,
    appName: string
  ): Promise<Pagination<Session>> {
    const startIndex = (page - 1) * limit;

    const total = await this.sessionModel.countDocuments();
    // Get sessions filtered by appName (field Options.Options.GridAppName)
    const data = await this.sessionModel
      .find({
        'Options.Options.GridAppName': appName,
      })
      .skip(startIndex)
      .limit(limit)
      .exec();

    const meta = this.paginationService.createMeta(total, page, limit);

    return {
      data,
      meta,
    };
  }

  /**
   * Get one session by id from the database
   *
   * @param id Id of the session
   *
   * @returns Session
   */
  async findOne(id: string): Promise<Session> {
    return this.sessionModel.findById(id).exec();
  }
}
