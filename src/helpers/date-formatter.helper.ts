export default class DateFormatterHelper {
  static formatDate(dateNow: number) {
    let formattedDate = new Intl.DateTimeFormat("pt-br", {
      timeZone: "America/Sao_Paulo",
      dateStyle: "short",
      timeStyle: "medium",
    }).format(dateNow);

    return formattedDate
      .replace(/\//g, "")
      .replace(/\,\s/g, "_")
      .replace(/\:/g, "");
  }
}
