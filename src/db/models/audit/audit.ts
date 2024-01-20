import Logger from "../../../logger/logger";
import { Audit } from "./audit.model";
import { AuditInput } from "./audit.type";

/**
 * Audit action class to add audit logs of the important operations to the database
 */
export default class AuditAction {
  private static logger = new Logger("Audit");
  public static async add(auditInput: AuditInput): Promise<void> {
    try {
      const audit = new Audit(auditInput);
      const newAudit = await audit.save({ new: true });
      this.logger.log(
        `id \"${newAudit._id}\" by \"${newAudit.initiator}\" do \"${newAudit.action}\" on \"${newAudit.target}\" with result \"${newAudit.result}\"`
      );
    } catch (error) {
      this.logger.log(
        "Updating audit resulted with an error: " + error,
        "error"
      );
    }
  }
}
