import DateFormatterHelper from "../../src/helpers/date-formatter.helper";
import { LoggerLevels } from "../../src/types/logger-levels";

import { appendFileSync, existsSync } from "node:fs";

export default class Logger {
  constructor(
    private readonly logFilePath: string,
    public appName: string,
    public dateFormatterHelper = DateFormatterHelper,
  ) {
    this.logFilePath = logFilePath;

    if (existsSync(logFilePath) == false) {
      this.makeFile();
    }

    this.addNewLine();
  }

  private addNewLine() {
    appendFileSync(this.logFilePath, "\n");
  }

  private makeFile() {
    appendFileSync(
      this.logFilePath,
      `============= LOG ${this.appName} =============\n\n`,
    );
  }

  private getFormattedDate() {
    return this.dateFormatterHelper.formatDate(Date.now());
  }

  private appendLog(content: string) {
    appendFileSync(this.logFilePath, content);
    process.stdout.write(content);
  }

  private formatLine(message: string) {
    return `[${this.getFormattedDate()}]: ${message}\n`;
  }

  public log(level: LoggerLevels = "INFO", message: string): void {
    this.appendLog(`${level} - ${this.formatLine(message)}`);
  }
}
