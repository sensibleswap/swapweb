const OSS = require('ali-oss');
const path = require('path');
const readdir = require('readdir');

const gitCommitHash = process.env.GITHUB_SHA.substr(0, 7);

// console.log(process.env.GITHUB_SHA, process.env.ALIYUN_OSS_SECRET);

const client = new OSS({
  region: 'oss-cn-hongkong',
  accessKeyId: 'LTAI5tL3nUgFyKsgsXTh3JkM',
  accessKeySecret: process.env.aliyun_oss_secret,
  bucket: 'volt',
});

const main = async () => {
  const dirFiles = readdir.readSync(path.resolve(__dirname, '../dist'));

  for (let fileName of dirFiles) {
    const url = `/tokenswap/${gitCommitHash}/${fileName}`;
    await client.put(url, path.resolve(__dirname, '../dist', fileName));
  }
};

main();
