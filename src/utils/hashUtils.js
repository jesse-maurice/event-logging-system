import { createHash } from 'crypto';

function generateHash(data) {
  return createHash("sha256").update(data).digest("hex");
}

export default { generateHash };
