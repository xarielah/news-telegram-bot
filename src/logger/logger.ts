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
   */
  public log(msg: string, type?: "error"): void {
    console.log(
      `[${this.prefix} ${type === "error" ? "ERROR " : ""}- ` +
        this.getDateTime() +
        "] " +
        msg
    );
  }

  private getDateTime() {
    const now = new Date();
    return now.toLocaleString();
  }
}
