import { corsair } from "@/utils/corsair";

async function main() {
  const client = corsair.withTenant("dev");

  const { messages } = await client.gmail.api.messages.list({
    maxResults: 1,
  });

  const emails = [];

  for (const msg of messages ?? []) {
    const another = await client.gmail.api.messages.get({
      id: msg.id!,
      format: "full",
    });

    console.log(`Mail Headers :: ${Object.keys(another.payload)}`);
    console.log(`Mail Body :: ${another.payload?.body}`);
  }

  // log(emails);
  // log(emails.length);
  // log(emails[0].payload);
}

main();
