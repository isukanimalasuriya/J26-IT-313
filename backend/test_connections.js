import { testDbConnection } from './src/config/db.js';
import S3Service from './src/services/s3Service.js';
import dotenv from 'dotenv';

dotenv.config();

async function runTests() {
  console.log('====================================');
  console.log(' 1. Testing MySQL Database Connection');
  console.log('====================================');
  const dbResult = await testDbConnection();
  console.log('MySQL Connection Result:', dbResult);

  console.log('\n====================================');
  console.log(' 2. Testing S3 Media Bucket Upload');
  console.log('====================================');
  const testFileName = `test-media-${Date.now()}.txt`;
  const fileBuffer = Buffer.from('Hello from Coconut Research Backend! S3 Media test successful.');

  try {
    const publicUrl = await S3Service.uploadFile({
      fileBuffer,
      key: testFileName,
      contentType: 'text/plain',
      isPublic: true,
    });
    console.log('S3 Upload Successful!');
    console.log('Uploaded File Key:', testFileName);
    console.log('Public URL:', publicUrl);
  } catch (s3Error) {
    console.error('S3 Upload Error:', s3Error.message);
    if (s3Error.name) console.error('Error Name:', s3Error.name);
  }

  console.log('\n====================================');
  console.log(' All tests completed.');
  console.log('====================================');
  process.exit(0);
}

runTests();
