import Logger from "../../../logger/logger";
import { Category } from "./category.model";
import { CategoryRecord } from "./category.type";

export default class NewsCategory {
  private static logger = new Logger("NewsCategory");

  public static async get(userId: number): Promise<CategoryRecord> {
    try {
      const foundCategories = await Category.findOne({ userId });
      if (!foundCategories) {
        await this.create(userId);
        return await this.get(userId);
      }

      return foundCategories;
    } catch (error) {
      this.logger.log(
        "Getting category resulted with an error: " + error,
        "error"
      );
      return null;
    }
  }

  /**
   * Adds a category to the user's categories list
   * @param {string} userId
   * @param {string[]} category
   * @returns
   */
  public static async add(userId: number, category: string): Promise<boolean> {
    try {
      const foundCategories = await Category.findOne({ userId });
      if (!foundCategories) {
        await this.create(userId, [category]);
        return true;
      }

      const categories = foundCategories.categories;
      if (categories.includes(category)) return false;

      await this.update(userId, [...categories, category]);
      return true;
    } catch (error) {
      this.logger.log(
        "Adding category resulted with an error: " + error,
        "error"
      );
      return false;
    }
  }

  /**
   * Creates a new user's categories list
   * @param {number} userId
   * @param {string[]} categories
   * @returns
   */
  public static async create(
    userId: number,
    categories?: string[]
  ): Promise<boolean> {
    try {
      const category = new Category({ userId, categories: categories || [] });
      await category.save();
      this.logger.log(
        `Categories record for user ID \"${userId}\" created successfuly.`
      );
      return true;
    } catch (error) {
      this.logger.log(
        "Creating category resulted with an error: " + error,
        "error"
      );
      return false;
    }
  }

  /**
   * Updates a user's categories list
   * @param {number} userId
   * @param {string[]} categories
   * @returns
   */
  public static async update(
    userId: number,
    categories: string[]
  ): Promise<boolean> {
    try {
      await Category.findOneAndUpdate({ userId }, { categories });
      this.logger.log(
        `Categories record for user ID \"${userId}\" updated successfuly.`
      );
      return true;
    } catch (error) {
      this.logger.log(
        "Updating category resulted with an error: " + error,
        "error"
      );

      return false;
    }
  }

  /**
   * Removes a category from the user's categories list
   * @param {string} userId
   * @param {string} category
   * @returns
   */
  public static async remove(
    userId: number,
    category: string
  ): Promise<boolean> {
    try {
      const foundCategories = await Category.findOne({ userId });
      if (!foundCategories) {
        await this.create(userId);
        return true;
      }

      const categories = foundCategories.categories;
      if (!categories.includes(category)) return false;

      await this.update(
        userId,
        categories.filter((c: string) => c !== category)
      );
      return true;
    } catch (error) {
      this.logger.log(
        "Removing category resulted with an error: " + error,
        "error"
      );
      return false;
    }
  }
}
