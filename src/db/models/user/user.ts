import Logger from "../../../logger/logger";
import { RegisteredUser } from "./user.model";
import { RegisterUser } from "./user.type";

export default class User {
  private static logger = new Logger("User");

  /**
   * Return all active users
   */
  public static async getAllActive(): Promise<any[]> {
    return await RegisteredUser.find({ active: true });
  }

  /**
   * Returns -1 if user already exists
   * Returns 1 if user is registered successfuly
   * @param {RegisterUser} user
   * @returns -1 | 1
   */
  public static async subscribe(user: RegisterUser): Promise<-1 | 1> {
    try {
      const isUserExists = await RegisteredUser.findOne({
        userId: user.userId,
      });

      const successMessage = `User \"${user.username}:${user.userId}\" subscribed successfuly.`;
      const errorMessage = `User \"${user.username}:${user.userId}\" already subscribed.`;

      // User already subscribed
      if (isUserExists) {
        if (isUserExists.active) {
          // User already subscribed
          User.logger.log(errorMessage);
          return -1;
        } else {
          await RegisteredUser.findOneAndUpdate(
            { userId: user.userId },
            { active: true }
          );
          User.logger.log(successMessage);
          // User subscribed successfuly
          return 1;
        }
      }

      // Create user in database (user defaulty subscribed)
      const registeredUser = new RegisteredUser(user);
      await registeredUser.save();

      // User subscribed successfuly
      User.logger.log(successMessage);
      return 1;
    } catch (error) {
      User.logger.log(
        "Updating user resulted with an error: " + error,
        "error"
      );
      return -1;
    }
  }

  /**
   * Returns -1 if user already unsubscribed
   * Returns 1 if user is unsubscribed successfuly
   * Returns 0 if user does not exists
   * @param {number} userId
   * @returns -1 | 1 | 0
   */
  public static async unsubscribe(userId: number): Promise<-1 | 1 | 0> {
    try {
      const user = await RegisteredUser.findOne({
        userId,
      });

      // User does not exists
      if (!user) {
        this.logger.log(`User \"${user.username}:${userId}\" does not exists.`);
        return 0;
      }

      // User already unsubscribed
      if (!user.active) {
        this.logger.log(
          `User \"${user.username}:${userId}\" already unsubscribed.`
        );
        return -1;
      }

      await RegisteredUser.findOneAndUpdate({ userId }, { active: false });
      this.logger.log(
        `User \"${user.username}:${userId}\" unsubscribed successfuly.`
      );
      return 1;
    } catch (error) {
      User.logger.log(
        "Updating user resulted with an error: " + error,
        "error"
      );
      return 0;
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
  public static async setSourceLimit(
    userId: number,
    limit: number | string
  ): Promise<-1 | 0 | 1> {
    try {
      if (isNaN(+limit) || +limit < 1 || +limit > 20) {
        this.logger.log(
          `User \"${userId}\" invalid input entered.`,
          null,
          null,
          false
        );

        return -1;
      }

      await RegisteredUser.findOneAndUpdate({ userId }, { sourceLimit: limit });
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
