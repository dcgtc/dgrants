import { create } from 'ipfs-http-client';
import { config } from 'dotenv';
config({ path: './.env' });

const ipfs = create({
  url: 'https://ipfs-api.dev.fleek.cool',
  headers: {
    Authorization: `v2 ${process.env.FLEEK_API_KEY}`, // or Bearer <JWT> or public <AppKey>
  },
});

const main = async () => {
  const res = await ipfs.add(JSON.stringify({ name: 'dgrants', description: 'ipfs poc' }));
  console.log(res.cid);
  for await (const file of ipfs.get(res.cid)) {
    console.log(file.type, file.path);

    // @ts-ignore
    if (!file.content) continue;

    const content = [];
    // @ts-ignore
    for await (const chunk of file.content) {
      content.push(chunk);
    }

    console.log(content.toString());
  }
};

main().catch((e) => console.log(e));
