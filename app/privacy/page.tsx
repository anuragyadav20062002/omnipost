import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8 text-center gradient-text">Privacy Policy</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>1. Information We Collect</CardTitle>
        </CardHeader>
        <CardContent>
          <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, items requested, delivery notes, and other information you choose to provide.</p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>2. How We Use Your Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>We use the information we collect about you to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process and complete transactions, and send you related information</li>
            <li>Send you technical notices, updates, security alerts, and support and administrative messages</li>
            <li>Respond to your comments, questions, and requests, and provide customer service</li>
            <li>Communicate with you about products, services, offers, promotions, rewards, and events</li>
            <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>3. Sharing of Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>We may share the information we collect about you as described in this policy or as described at the time of collection or sharing, including as follows:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>With vendors, consultants, and other service providers who need access to such information to carry out work on our behalf</li>
            <li>In response to a request for information if we believe disclosure is in accordance with, or required by, any applicable law, regulation, or legal process</li>
            <li>If we believe your actions are inconsistent with our user agreements or policies, or to protect the rights, property, and safety of OmniPost or others</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>4. Security</CardTitle>
        </CardHeader>
        <CardContent>
          <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration, and destruction.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Changes to this Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <p>We may change this privacy policy from time to time. If we make significant changes in the way we treat your personal information, or to the privacy policy, we will provide notice to you through the Services or by some other means, such as email. Your continued use of the Services after such notice constitutes your consent to the changes.</p>
        </CardContent>
      </Card>
    </div>
  )
}

