import Logger from "../../../logger/logger";
import { Audit } from "./audit.model";
import { AuditInput } from "./audit.type";

/**
 * Audit action class to add audit logs of the important operations to the database
 */
export default class AuditAction {
  public static async add(auditInput: AuditInput): Promise<void> {
    try {
      const audit = new Audit(auditInput);
      await audit.save({ new: true });
    } catch (error) {
      const logger = new Logger("Audit");
      logger.log("Updating audit resulted with an error: " + error, "error");
    }
  }
}
