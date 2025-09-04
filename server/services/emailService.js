/**
 * Email Service for AdRemix
 * Handles sending transactional emails (verification, password reset, etc.)
 */

/**
 * Mock email service - replace with real email provider (SendGrid, AWS SES, etc.)
 * For production, integrate with your preferred email service
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  // In development, just log the email
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 Email would be sent:');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML: ${html}`);
    console.log('---');
    return { success: true, messageId: 'dev-' + Date.now() };
  }

  // For production, implement real email sending
  // Example with SendGrid:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to,
    from: process.env.FROM_EMAIL,
    subject,
    html,
    text
  };
  
  try {
    const response = await sgMail.send(msg);
    return { success: true, messageId: response[0].headers['x-message-id'] };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
  */

  // Mock success for now
  return { success: true, messageId: 'mock-' + Date.now() };
};

/**
 * Send welcome email to new users
 */
export const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to AdRemix!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #007bff;">Welcome to AdRemix, ${user.firstName}!</h1>
      <p>Thank you for joining AdRemix, the AI-powered ad variation generator.</p>
      
      <h2>What's Next?</h2>
      <ul>
        <li>Upload your first product image</li>
        <li>Generate AI-powered ad variations</li>
        <li>Connect your social media accounts</li>
        <li>Start testing and optimizing your ads</li>
      </ul>
      
      <p>
        <a href="${process.env.FRONTEND_URL}/create" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Create Your First Ad
        </a>
      </p>
      
      <p>If you have any questions, feel free to reach out to our support team.</p>
      
      <p>Best regards,<br>The AdRemix Team</p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject,
    html
  });
};

/**
 * Send subscription confirmation email
 */
export const sendSubscriptionEmail = async (user, subscriptionDetails) => {
  const subject = `Subscription ${subscriptionDetails.status === 'active' ? 'Activated' : 'Updated'} - AdRemix`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #28a745;">Subscription ${subscriptionDetails.status === 'active' ? 'Activated' : 'Updated'}!</h1>
      
      <p>Hi ${user.firstName},</p>
      
      <p>Your AdRemix subscription has been ${subscriptionDetails.status === 'active' ? 'activated' : 'updated'}.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>Subscription Details:</h3>
        <p><strong>Plan:</strong> ${subscriptionDetails.tier}</p>
        <p><strong>Status:</strong> ${subscriptionDetails.status}</p>
        <p><strong>Next Billing:</strong> ${new Date(subscriptionDetails.currentPeriodEnd).toLocaleDateString()}</p>
      </div>
      
      <p>
        <a href="${process.env.FRONTEND_URL}/settings" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Manage Subscription
        </a>
      </p>
      
      <p>Thank you for choosing AdRemix!</p>
      
      <p>Best regards,<br>The AdRemix Team</p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject,
    html
  });
};

/**
 * Send usage limit warning email
 */
export const sendUsageLimitWarning = async (user, usageType, percentage) => {
  const subject = `Usage Limit Warning - AdRemix`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ffc107;">Usage Limit Warning</h1>
      
      <p>Hi ${user.firstName},</p>
      
      <p>You've used ${percentage}% of your monthly ${usageType} limit.</p>
      
      <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3>Current Usage:</h3>
        <p><strong>Plan:</strong> ${user.subscription.tier}</p>
        <p><strong>Usage:</strong> ${user.currentUsage[usageType]}/${user.getUsageLimits()[usageType]} ${usageType}</p>
      </div>
      
      <p>Consider upgrading your plan to continue using AdRemix without interruption.</p>
      
      <p>
        <a href="${process.env.FRONTEND_URL}/settings" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Upgrade Plan
        </a>
      </p>
      
      <p>Best regards,<br>The AdRemix Team</p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject,
    html
  });
};
