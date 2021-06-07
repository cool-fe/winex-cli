/* eslint-disable import/no-dynamic-require */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import Minio from 'minio';
import path from 'path';
import chalk from 'chalk';
import fs from 'fs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require(`${process.cwd()}/package.json`);

module.exports = async () => {
  const minioClient = new Minio.Client({
    endPoint: '172.16.6.51',
    port: 9000,
    useSSL: false,
    accessKey: 'www.winning.com.cn',
    secretKey: 'www.winning.com.cn'
  });
  const filepath = `materials/${pkg.name}/${pkg.version}/`;
  const file = `${process.cwd()}/lib/`;
  // const filename = pkg.name.split("/")[1] || "";
  const metaData = {
    'Content-Type': 'application/octet-stream',
    'X-Amz-Meta-Testing': 1234,
    example: 5678
  };

  // 上传方法
  const upload = (_path: string, _file: string) => {
    minioClient.fPutObject('winex', _path, _file, metaData, (err) => {
      if (!err) {
        console.log(chalk.green(`上传成功`));
      } else {
        console.log(err, 'err');
      }
    });
  };

  // 区分文件和文件夹然后上传
  const classifyFiles = (__path: string, __file: string) => {
    fs.readdir(__file, (err, files) => {
      files.forEach((filename) => {
        const filedir = path.join(file, filename);
        fs.stat(filedir, (error, stats) => {
          if (!error) {
            const isFile = stats.isFile(); //是文件
            if (isFile) {
              upload(`${__path}${filename}`, `${__file}${filename}`);
            } else {
              classifyFiles(`${__path}${filename}/`, `${__file}${filename}/`);
            }
          }
        });
      });
    });
  };

  classifyFiles(filepath, file);
};
