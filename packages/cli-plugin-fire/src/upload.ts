import path from 'path';
import chalk from 'chalk';
import fs from 'fs';

const Minio = require('minio');

export default async () => {
  const minioClient = new Minio.Client({
    endPoint: '172.16.6.51',
    port: 9000,
    useSSL: false,
    accessKey: 'www.winning.com.cn',
    secretKey: 'www.winning.com.cn'
  });
  const pkg = require(`${process.cwd()}/package.json`);
  const metaData = {
    'Content-Type': 'application/octet-stream',
    'X-Amz-Meta-Testing': 1234,
    example: 5678
  };

  // 区分文件和文件夹然后上传
  // const materialClassify = pkg.name.split('/')[0].split('-')[1]
  const domainName = pkg.name.split('/')[1].split('-')[0];
  const filepath = `materials-umd-lib/${domainName}/${pkg.name}/${pkg.version}/`;
  const file = `${process.cwd()}/lib/`;

  const classifyFiles = (filepath: string, file: any) => {
    fs.readdir(file, (err, files) => {
      files.forEach((filename) => {
        const filedir = path.join(file, filename);
        fs.stat(filedir, (err, stats) => {
          if (!err) {
            const isFile = stats.isFile(); //是文件
            if (isFile) {
              upload(`${filepath}${filename}`, `${file}${filename}`);
            } else {
              classifyFiles(`${filepath}${filename}/`, `${file}${filename}/`);
            }
          }
        });
      });
    });
  };
  // 上传方法
  const upload = (filepath: string, files: any) => {
    minioClient.fPutObject('winex', filepath, files, metaData, (err: any) => {
      if (!err) {
        console.log(chalk.green(`upload success`));
      } else {
        console.log(err, 'err');
      }
    });
  };
  classifyFiles(filepath, file);
};