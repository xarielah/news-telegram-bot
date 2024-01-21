import AuditAction from "../db/models/audit/audit";

/**
 * Basic logger class
 */
export default class Logger {
  private prefix = "";

  /**
   * Initialize logger with a specific prefix
   * @param {string} prefix
   */
  constructor(prefix: string) {
    this.prefix = prefix;
  }

  /**
   * Logs a message with a prefix and a timestamp
   * @param {string} msg
   * @param {"error"} type
   * @param {string} action
   */
  public async log(
    msg: string,
    type?: "error",
    action?: string,
    log?: boolean
  ): Promise<void> {
    console.log(
      `[${this.prefix} ${type === "error" ? "ERROR " : ""}- ` +
        this.getDateTime() +
        "] " +
        msg
    );

    if (log === false) return;

    await AuditAction.add({
      initiator: this.prefix,
      action: msg,
      target: action ? action : "logger",
      result: type === "error" ? "failed" : "success",
    });
  }

  private getDateTime() {
    const now = new Date();
    return now.toLocaleString();
  }
}
