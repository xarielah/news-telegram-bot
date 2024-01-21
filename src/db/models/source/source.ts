import Logger from "../../../logger/logger";
import { Source } from "./source.model";
import { SourceRecord } from "./source.type";

export default class NewsSource {
  private static logger = new Logger("NewsSource");

  /**
   * Get a user's sources list
   * @param {string} userId
   * @returns
   */
  public static async get(userId: number): Promise<SourceRecord> {
    try {
      const foundSources = await this.findOrCreate(userId);

      return foundSources;
    } catch (error) {
      this.logger.log(
        "Getting source resulted with an error: " + error,
        "error"
      );
      return null;
    }
  }

  /**
   * Creates a new user's sources list
   * @param {string} userId
   * @param {string[]} sources
   */
  private static async create(
    userId: number,
    sources?: string[]
  ): Promise<SourceRecord> {
    try {
      const source = new Source({ userId, sources: sources || [] });
      const newSrc = await source.save({ new: true });
      this.logger.log(
        `Sources record for user ID \"${userId}\" created successfuly.`
      );
      return newSrc;
    } catch (error) {
      this.logger.log(
        "Creating source resulted with an error: " + error,
        "error"
      );
      return null;
    }
  }

  /**
   * Updates a user's sources list
   * @param {string} userId
   * @param {string[]} sources
   */
  public static async update(
    userId: number,
    sources: string[]
  ): Promise<boolean> {
    try {
      await Source.findOneAndUpdate({ userId }, { sources });
      this.logger.log(
        `Sources record for user ID \"${userId}\" updated successfuly.`
      );
      return true;
    } catch (error) {
      this.logger.log(
        "Updating source resulted with an error: " + error,
        "error"
      );

      return false;
    }
  }

  /**
   * Adds a new source to the user's sources list
   * @param {number} userId
   * @param {string} sourceId
   * @returns
   */
  public static async add(userId: number, sourceId: string): Promise<boolean> {
    try {
      const foundSource = await this.findOrCreate(userId);

      const userSources = foundSource.sources;
      // Source already added
      if (Array.isArray(userSources) && userSources.includes(sourceId)) {
        return false;
      }

      // Add source to user's sources list
      await this.update(userId, [...userSources, sourceId]);
      return true;
    } catch (_) {
      return false;
    }
  }

  private static async findOrCreate(userId: number): Promise<SourceRecord> {
    return (await Source.findOne({ userId })) || (await this.create(userId));
  }

  /**
   * Removes a source from the user's sources list
   * @param {string} sourceId
   * @returns
   */

  public static async remove(userId: number, sourceId: string) {
    try {
      const foundSource = await this.findOrCreate(userId);

      const userSources = foundSource.sources;
      // Source already removed
      if (Array.isArray(userSources) && !userSources.includes(sourceId)) {
        return false;
      }

      // Remove source from user's sources list
      await this.update(
        userId,
        userSources.filter((source: string) => source !== sourceId)
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Updates a user's sources limit, returns -1 if limit is not a number
   * Returns 1 if user's source limit is updated successfuly
   * Returns 0 for any other error
   * @param userId
   * @param limit
   * @returns -1 | 0 | 1
   */
  public static async setPageSize(
    userId: number,
    limit: number | string
  ): Promise<0 | 1> {
    try {
      // Here we make sure if we don't have source record it'll be created
      await this.findOrCreate(userId);

      // Update user's source limit
      await Source.findOneAndUpdate({ userId }, { pageSize: +limit });
      this.logger.log(`User \"${userId}\" source limit updated successfuly.`);
      return 1;
    } catch (error) {
      this.logger.log(
        "Updating user resulted with an error: " + error,
        "error"
      );
      return 0;
    }
  }
}
