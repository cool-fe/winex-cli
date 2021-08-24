import path from 'path';
import chalk from 'chalk';

const Minio = require('minio');

const MATERIAL_PATH = 'build/materials.json';

// upload minio oss
function upload(bucket: string, filepath: string, file: string, metaData: any): Promise<void> {
  const minioClient = new Minio.Client({
    endPoint: '172.16.6.51',
    port: 9000,
    useSSL: false,
    accessKey: 'www.winning.com.cn',
    secretKey: 'www.winning.com.cn'
  });
  return new Promise((resolve, reject) => {
    minioClient.fPutObject(bucket, filepath, file, metaData, (err) => {
      if (!err) {
        resolve();
      } else {
        reject(err);
      }
    });
  });
}

export default async function uploadMaterialDatas(dir: string): Promise<void> {
  const materilDatas = require(`${dir}/${MATERIAL_PATH}`);
  if (!materilDatas.key) {
    console.log(chalk.red('package.json 中materialConfig缺少key'));
    console.log(
      chalk.red(
        'key可以为common、finance、clinical、execution、person、encouter、record、knowledge、material'
      )
    );
    process.exit(-1);
  }

  const filepath = `materials/${materilDatas.key}-materials.json`;
  const file = path.resolve(dir, './build/materials.json');
  const metaData = {
    'Content-Type': 'application/octet-stream',
    'X-Amz-Meta-Testing': 1234,
    example: 5678
  };

  await upload('winex', filepath, file, metaData);
}
