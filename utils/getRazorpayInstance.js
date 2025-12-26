const Razorpay = require("razorpay");

module.exports = (keyId, keySecret) => {
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};
