/**
 * Simple in-memory key manager for demo.
 * In production persist keys in DB or secure KMS and rotate periodically.
 */
import crypto from "crypto";

const KEY_RETENTION = 5; // keep last 5 keys

class KeyManager {
  constructor() {
    this.keys = []; // [{kid, secret, createdAt}]
    this.generateKey();
  }

  generateKey() {
    const k = crypto.randomBytes(48).toString("base64");
    const kid = crypto.randomBytes(8).toString("hex");
    const key = { kid, secret: k, createdAt: new Date() };
    this.keys.unshift(key);
    if (this.keys.length > KEY_RETENTION) this.keys.pop();
    return key;
  }

  getCurrent() {
    return this.keys[0];
  }

  getByKid(kid) {
    return this.keys.find((k) => k.kid === kid);
  }

  rotate() {
    return this.generateKey();
  }

  all() {
    return this.keys;
  }
}

export default new KeyManager();
