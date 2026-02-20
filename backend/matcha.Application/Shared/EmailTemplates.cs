namespace matcha.Application.Shared
{
    public static class EmailTemplates
    {

        public static Dictionary<string, string> BuildPlaceHolders(string userName, string confirmationLink)
        {
            return new Dictionary<string, string>
            {
                { "userName", userName},
                { "confirmationLink",confirmationLink}
            };
        }
        public static string BuildEmailTemplate(string template, Dictionary<string, string> placeholders)
        {
            foreach (var placeholder in placeholders)
            {
                template = template.Replace($"{{{{{placeholder.Key}}}}}", placeholder.Value);
            }

            return template;
        }

        public static string ConfirmationEmailTemplate =>
        @"
        <html>
          <body>
            <p>Hello {{userName}},</p>
            <p>Thank you for registering with us! To complete your registration, please confirm your email address by clicking the link below:</p>
            <p><a href='{{confirmationLink}}' style='color: #007bff; text-decoration: none; font-weight: bold;'>Confirm Your Email Address</a></p>
            <p>If you did not request this, please ignore this email. Your account will remain unconfirmed.</p>
            <p>Best regards,</p>
            <p>The Matcha Team</p>
          </body>
        </html>";

        public static string ResetPasswordTemplate =>
        @"
        <html>
          <body>
            <p>Hello {{userName}},</p>
            <p>We received a request to reset your password. If you made this request, please click the link below to reset your password:</p>
            <p><a href=""{{confirmationLink}}"" style='color: #007bff; text-decoration: none; font-weight: bold;'>Reset Your Password</a></p>
            <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
            <p>Best regards,</p>
            <p>The Matcha Team</p>
          </body>
        </html>";

        public static string CompleteUserProfileEmailTemplate =>
            @"<h1>One Last Step, {{userName}}!</h1>
              <p>You’ve provided all the necessary details for your profile. Please confirm your profile completion by clicking the link below:</p>
                <a href=""{{confirmationLink}}"">Confirm My Profile Completion</a>
                <p>If you didn’t make this request, please ignore this email.</p>";
    }
}
