/**
 * EMPEROR GUILD STUDIOS - STARTUP AUTH TEMPLATES
 * Theme: Obsidian & Amethyst (#6518BC)
 */

const footer = `
  <div style="margin-top: 40px; border-top: 1px solid #222; padding-top: 24px; text-align: center;">
    <p style="color: #6518BC; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.35em; margin: 0;">
      Software Development & Strategy
    </p>
    <p style="color: #444; font-size: 8px; margin-top: 12px; letter-spacing: 1px; text-transform: uppercase;">
      &copy; 2026 EMPEROR GUILD STUDIOS &bull; PORT HARCOURT
    </p>
  </div>
`;

exports.briefConfirmationTemplate = (data) => `
  <div style="background-color: #0D0D0D; color: #FDFDFD; font-family: 'Inter', Helvetica, Arial, sans-serif; padding: 60px 20px; border: 1px solid #171717;">
    <div style="max-width: 600px; margin: 0 auto;">
      <p style="color: #6518BC; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5em; margin-bottom: 24px;">
        Protocol // Project Intake
      </p>

      <h1 style="font-size: 32px; font-weight: 900; letter-spacing: -0.04em; margin: 0 0 16px 0; color: #FDFDFD;">
        Transmission <span style="color: #6518BC;">Received</span>
      </h1>
      
      <p style="color: #D1D5DB; font-size: 14px; line-height: 1.6; margin-bottom: 40px;">
        Hello ${data.contactName}, your project brief for <strong>${data.companyName}</strong> has been successfully uploaded to our secure network. Our strategy team is currently reviewing your requirements.
      </p>

      <div style="background-color: #111; border-left: 4px solid #6518BC; padding: 24px; border-radius: 4px; margin-bottom: 40px;">
        <h3 style="color: #6518BC; font-size: 11px; text-transform: uppercase; margin-top: 0; letter-spacing: 1px;">Project Summary</h3>
        <table style="width: 100%; color: #FDFDFD; font-size: 13px; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #444; width: 120px;">Industry:</td>
            <td style="padding: 8px 0;">${data.industry}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #444;">Project Type:</td>
            <td style="padding: 8px 0;">${data.projectType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #444;">Timeline:</td>
            <td style="padding: 8px 0;">${data.timeline}</td>
          </tr>
        </table>
      </div>

      <p style="color: #D1D5DB; font-size: 14px; line-height: 1.6;">
        Next Step: Our lead architect will reach out via <strong>${data.email}</strong> within 24-48 hours to schedule a deep-dive discovery call.
      </p>

      <div style="margin-top: 40px; padding: 20px; border: 1px dashed #222; text-align: center;">
        <p style="color: #484848; font-size: 11px; margin: 0;">
          Transaction ID: ${data._id} <br/>
          Secure Node: PH-NG-084
        </p>
      </div>

      ${footer}
    </div>
  </div>
`;

exports.otpTemplate = (otp) => `
  <div style="background-color: #0D0D0D; color: #FDFDFD; font-family: 'Inter', Helvetica, Arial, sans-serif; padding: 60px 20px; border: 1px solid #171717;">
    <div style="max-width: 500px; margin: 0 auto;">
      <p style="color: #6518BC; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5em; margin-bottom: 24px;">
        Authentication // Secure Protocol
      </p>

      <h1 style="font-size: 36px; font-weight: 900; letter-spacing: -0.04em; margin: 0 0 16px 0; color: #FDFDFD;">
        Login <span style="color: #6518BC;">Verification</span>
      </h1>
      
      <p style="color: #D1D5DB; font-size: 14px; line-height: 1.6; margin-bottom: 40px;">
        Use the following one-time code to authenticate your session within the Emperor Guild internal network.
      </p>

      <div style="background-color: #171717; border: 1px solid #484848; padding: 32px; border-radius: 4px; display: inline-block;">
        <span style="font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #FDFDFD; padding-left: 12px;">
          ${otp}
        </span>
      </div>

      <p style="color: #484848; font-size: 11px; margin-top: 40px; font-weight: 500; line-height: 1.5;">
        This token expires in 10 minutes. <br/>
        If you did not request this code, please contact the security lead immediately.
      </p>

      ${footer}
    </div>
  </div>
`;

exports.welcomeTemplate = (name) => `
  <div style="background-color: #0D0D0D; color: #FDFDFD; font-family: 'Inter', Helvetica, Arial, sans-serif; padding: 60px 20px;">
    <div style="max-width: 500px; margin: 0 auto; text-align: center;">
      <p style="color: #42D8CE; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5em; margin-bottom: 24px;">
        Onboarding // Account Deployed
      </p>

      <h1 style="font-size: 42px; font-weight: 900; letter-spacing: -0.05em; margin: 0 0 24px 0; line-height: 1;">
        Welcome to the <br/>
        <span style="color: #6518BC;">Team</span>, ${name}
      </h1>

      <p style="color: #D1D5DB; font-size: 15px; line-height: 1.8; margin-bottom: 48px;">
        Your developer access is now provisioned. You have full administrative control to manage internal tools and platform deployments.
      </p>

      <a href="https://emperorguild.studio/admin" 
         style="display: inline-block; background-color: #6518BC; color: #ffffff; padding: 20px 45px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.25em; text-decoration: none; border-radius: 2px;">
        Launch Dev Console
      </a>

      ${footer}
    </div>
  </div>
`;
