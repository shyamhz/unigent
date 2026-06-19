export function getAccessGrantedEmail(userName: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://unigent.in";
  const onboardingUrl = `${appUrl}/onboarding`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Unigent</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0B0D; font-family: 'Inter', -apple-system, 'Segoe UI', sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0B0B0D; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; width: 100%;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom: 32px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: rgba(111, 107, 239, 0.12); border-radius: 8px; padding: 8px 12px;">
                    <span style="font-size: 14px; color: #6F6BEF; font-weight: 600; letter-spacing: -0.01em;">&#9889; Unigent</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color: #131316; border: 1px solid rgba(255,255,255,0.10); border-radius: 14px; padding: 40px 36px;">

              <!-- Headline -->
              <tr>
                <td style="padding-bottom: 16px;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #F5F5F7; letter-spacing: -0.01em; line-height: 1.3;">
                    You're in, ${userName || "there"}
                  </h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding-bottom: 32px;">
                  <p style="margin: 0; font-size: 15px; color: #9B9BA3; line-height: 1.6;">
                    Your Unigent account has been activated. You now have access to the AI agent workspace — automate tasks across Gmail and Calendar with natural language commands.
                  </p>
                </td>
              </tr>

              <!-- Tier Info -->
              <tr>
                <td style="padding-bottom: 32px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="background-color: #1C1C22; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 16px 20px;">
                        <span style="font-size: 11px; font-weight: 500; color: #6E6E76; text-transform: uppercase; letter-spacing: 0.05em;">Free Tier</span>
                        <br/>
                        <span style="font-size: 13px; color: #9B9BA3; line-height: 1.6;">
                          20 emails/day &middot; 15 calendar events/day &middot; AI support locked
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CTA Button -->
              <tr>
                <td style="padding-bottom: 32px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td align="center">
                         <a href="${onboardingUrl}" style="display: inline-block; background-color: #6F6BEF; color: #FFFFFF; font-size: 14px; font-weight: 500; text-decoration: none; padding: 12px 28px; border-radius: 8px; letter-spacing: 0.01em;">
                          Set Up Your Workspace
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td style="padding-bottom: 24px;">
                  <div style="height: 1px; background-color: rgba(255,255,255,0.06);"></div>
                </td>
              </tr>

              <!-- What's Next -->
              <tr>
                <td>
                  <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 500; color: #F5F5F7;">
                    What happens next:
                  </p>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="padding: 6px 0;">
                        <span style="font-size: 13px; color: #9B9BA3;">
                          1. Sign in and connect your Gmail &amp; Calendar
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0;">
                        <span style="font-size: 13px; color: #9B9BA3;">
                          2. Type a command — the agent handles the rest
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0;">
                        <span style="font-size: 13px; color: #9B9BA3;">
                          3. Upgrade to Pro for unlimited access &amp; AI support
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 0 0 0; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #6E6E76; line-height: 1.5;">
                Unigent &middot; AI Agents at the Speed of Thought
                <br/>
                <a href="https://unigent.in" style="color: #6F6BEF; text-decoration: none;">unigent.in</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
