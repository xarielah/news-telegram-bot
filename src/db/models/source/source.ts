import Logger from "../../../logger/logger";
import { Source } from "./source.model";

export default class NewsSource {
  private static logger = new Logger("NewsSource");
  public static async add(source: SourceInput): Promise<boolean> {
    const isSourceExists = await Source.findOne({
      $or: [{ name: source.name }, { url: source.url }],
    });

    if (
      (Array.isArray(isSourceExists) && isSourceExists.length > 0) ||
      isSourceExists !== null
    ) {
      return false;
    }

    const newSource = new Source(source);
    await newSource.save();
    this.logger.log(`Admin added ${source} to the sources list`);
    return true;
  }
}
