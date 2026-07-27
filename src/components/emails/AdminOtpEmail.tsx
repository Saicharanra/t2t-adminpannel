import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface AdminOtpEmailProps {
  adminName: string;
  otp: string;
  ipAddress: string;
  browser: string;
  os: string;
  loginTime: string;
}

export const AdminOtpEmail = ({
  adminName = "Administrator",
  otp = "000000",
  ipAddress = "127.0.0.1",
  browser = "Unknown Browser",
  os = "Unknown OS",
  loginTime = new Date().toLocaleString(),
}: AdminOtpEmailProps) => {
  const previewText = `Your T2T Admin Verification Code: ${otp}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <div style={logoWrapper}>
              <span style={logoText}>T2T</span>
            </div>
            <Heading style={headerTitle}>Trash2Treasure</Heading>
            <Text style={headerSubtitle}>Admin Security Verification</Text>
          </Section>

          {/* Card */}
          <Section style={card}>
            <Heading style={heading}>Verify Your Identity</Heading>
            
            <Text style={paragraph}>Hello {adminName},</Text>
            <Text style={paragraph}>
              We received a request to sign in to your T2T Admin account.
              Use the verification code below to continue.
            </Text>

            {/* OTP Display Box */}
            <Section style={otpBox}>
              <Text style={otpText}>{otp}</Text>
            </Section>

            <Text style={expirationNotice}>
              This verification code expires in 5 minutes.
            </Text>

            <Hr style={divider} />

            {/* Security Notice */}
            <Section style={securityNoticeCard}>
              <Text style={securityTitle}>⚠️ Security Notice</Text>
              <ul style={securityList}>
                <li style={securityItem}>Never share this verification code with anyone.</li>
                <li style={securityItem}>T2T will never ask for your OTP.</li>
                <li style={securityItem}>If you didn&apos;t request this login, ignore this email.</li>
              </ul>
            </Section>

            <Hr style={divider} />

            {/* Request Details Table */}
            <Section>
              <Text style={detailsHeader}>Request Details</Text>
              <table style={detailsTable}>
                <tbody>
                  <tr>
                    <td style={detailsLabel}>IP Address</td>
                    <td style={detailsValue}>{ipAddress}</td>
                  </tr>
                  <tr>
                    <td style={detailsLabel}>Browser</td>
                    <td style={detailsValue}>{browser}</td>
                  </tr>
                  <tr>
                    <td style={detailsLabel}>Operating System</td>
                    <td style={detailsValue}>{os}</td>
                  </tr>
                  <tr>
                    <td style={detailsLabel}>Login Time</td>
                    <td style={detailsValue}>{loginTime}</td>
                  </tr>
                </tbody>
              </table>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>© 2026 Trash2Treasure Innovation LLP</Text>
            <Text style={footerSubtext}>Secure Administrator Authentication</Text>
            <Text style={footerAutomated}>This is an automated security email.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AdminOtpEmail;

// SaaS design inline styling
const main = {
  backgroundColor: "#F8FAFC",
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
  margin: "0 auto",
  padding: "40px 16px",
};

const container = {
  maxWidth: "560px",
  margin: "0 auto",
};

const headerSection = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logoWrapper = {
  display: "inline-block",
  width: "48px",
  height: "48px",
  backgroundColor: "#4F772D",
  borderRadius: "12px",
  lineHeight: "48px",
  textAlign: "center" as const,
  marginBottom: "12px",
};

const logoText = {
  color: "#FFFFFF",
  fontSize: "20px",
  fontWeight: "bold",
  letterSpacing: "0.5px",
};

const headerTitle = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#111827",
  margin: "0 0 4px 0",
  letterSpacing: "-0.5px",
};

const headerSubtitle = {
  fontSize: "13px",
  color: "#6B7280",
  margin: "0",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  fontWeight: "600",
};

const card = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: "16px",
  padding: "40px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02), 0 1px 3px rgba(0, 0, 0, 0.02)",
};

const heading = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#111827",
  marginBottom: "24px",
  textAlign: "left" as const,
  letterSpacing: "-0.5px",
};

const paragraph = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#374151",
  margin: "0 0 16px 0",
};

const otpBox = {
  backgroundColor: "#F4F7F2",
  border: "1.5px dashed #A3B18A",
  borderRadius: "12px",
  padding: "24px",
  textAlign: "center" as const,
  margin: "32px 0 16px 0",
};

const otpText = {
  fontSize: "44px",
  fontWeight: "800",
  letterSpacing: "8px",
  color: "#4F772D",
  margin: "0",
  lineHeight: "1.2",
};

const expirationNotice = {
  fontSize: "13px",
  color: "#6B7280",
  textAlign: "center" as const,
  margin: "0 0 24px 0",
};

const divider = {
  borderColor: "#F1F5F9",
  margin: "24px 0",
};

const securityNoticeCard = {
  backgroundColor: "#FFFBEB",
  border: "1px solid #FDE68A",
  borderRadius: "12px",
  padding: "16px 20px",
};

const securityTitle = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#92400E",
  margin: "0 0 8px 0",
};

const securityList = {
  margin: "0",
  paddingLeft: "20px",
  color: "#B45309",
  fontSize: "12.5px",
  lineHeight: "20px",
};

const securityItem = {
  marginBottom: "4px",
};

const detailsHeader = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#475569",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 12px 0",
};

const detailsTable = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const detailsLabel = {
  fontSize: "13px",
  color: "#6B7280",
  padding: "6px 0",
  borderBottom: "1px solid #F1F5F9",
  width: "35%",
};

const detailsValue = {
  fontSize: "13px",
  fontWeight: "500",
  color: "#1F2937",
  padding: "6px 0",
  borderBottom: "1px solid #F1F5F9",
};

const footerSection = {
  textAlign: "center" as const,
  marginTop: "32px",
};

const footerText = {
  fontSize: "12px",
  color: "#94A3B8",
  margin: "0 0 4px 0",
  fontWeight: "500",
};

const footerSubtext = {
  fontSize: "11px",
  color: "#cbd5e1",
  margin: "0 0 4px 0",
};

const footerAutomated = {
  fontSize: "11px",
  color: "#cbd5e1",
  margin: "0",
};
