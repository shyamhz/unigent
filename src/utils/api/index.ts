import { fetchEmailsFromDB } from "./gmail/index";

async function main() {
  const emails = await fetchEmailsFromDB("dev", {
    limit: 10,
    includeBody: true,
  });
  console.log("Emails:", emails[0]);
}

main();
