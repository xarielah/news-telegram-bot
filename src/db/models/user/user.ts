import Logger from "../../../logger/logger";
import { RegisteredUser } from "./user.model";
import { RegisterUser } from "./user.type";

export default class User {
  private static logger = new Logger("User");
  /**
   * Returns -1 if user already exists
   * Returns 1 if user is registered successfuly
   * @param {RegisterUser} user
   * @returns -1 | 1
   */
  public static async subscribe(user: RegisterUser): Promise<-1 | 1> {
    const isUserExists = await RegisteredUser.findOne({
      userId: user.userId,
    });

    const successMessage = `User \"${user.username}:${user.userId}\" subscribed successfuly`;
    const errorMessage = `User \"${user.username}:${user.userId}\" already subscribed`;

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
  }

  /**
   * Returns -1 if user already unsubscribed
   * Returns 1 if user is unsubscribed successfuly
   * Returns 0 if user does not exists
   * @param {number} userId
   * @returns -1 | 1 | 0
   */
  public static async unsubscribe(userId: number): Promise<-1 | 1 | 0> {
    const user = await RegisteredUser.findOne({
      userId,
    });

    // User does not exists
    if (!user) {
      return 0;
    }

    // User already unsubscribed
    if (!user.active) {
      return -1;
    }

    await RegisteredUser.findOneAndUpdate({ userId }, { active: false });
    return 1;
  }
}