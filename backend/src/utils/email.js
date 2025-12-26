// src/utils/email.js
const nodemailer = require('nodemailer');
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, NODE_ENV } = require('../config/env');
const logger = require('../config/logger');

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Verify transporter connection
transporter.verify((err, success) => {
  if (err) {
    logger.error('Email transporter connection failed ❌', err);
  } else {
    logger.info('Email transporter connected ✅');
  }
});

/**
 * Send email
 * @param {object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} [options.text]
 * @param {string} [options.html]
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: `"No Reply" <${EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    if (NODE_ENV !== 'production') {
      logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    logger.info(`Email sent successfully to: ${to} ✅`);
    return info;
  } catch (err) {
    logger.error(`Failed to send email to: ${to} ❌`, err);
    throw err;
  }
};

module.exports = { sendEmail };
