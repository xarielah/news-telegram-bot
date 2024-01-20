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
      const foundSources = await Source.findOne({ userId });
      if (!foundSources) {
        await this.create(userId);
        return await this.get(userId);
      }

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
  ): Promise<boolean> {
    try {
      const source = new Source({ userId, sources: sources || [] });
      await source.save();
      this.logger.log(
        `Sources record for user ID \"${userId}\" created successfuly.`
      );
      return true;
    } catch (error) {
      this.logger.log(
        "Creating source resulted with an error: " + error,
        "error"
      );
      return false;
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
      const foundSource = await Source.findOne({ userId });
      if (!foundSource) {
        await this.create(userId, [sourceId]);
        return true;
      }

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

  /**
   * Removes a source from the user's sources list
   * @param {string} sourceId
   * @returns
   */

  public static async remove(userId: number, sourceId: string) {
    try {
      const foundSource = await Source.findOne({ userId });

      // User sources does not exists
      if (!foundSource) {
        await this.create(userId);
        return true;
      }

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
}
