"use client"

import React from "react"
import { GuideSection } from "./GuideSection"
import { InteractiveTimeline } from "./InteractiveTimeline"
import { UtcClockWidget } from "./UtcClockWidget"
import { TermTooltip } from "./TermTooltip"

export function UserGuide() {
  const workflowEvents = [
    { title: "Create Content", description: "Write or upload your long-form content." },
    { title: "Repurpose", description: "Transform your content for different social media platforms." },
    { title: "Review", description: "Check and edit your repurposed content." },
    { title: "Schedule", description: "Set the date and time for your posts." },
    { title: "Publish", description: "Your posts are automatically published at the scheduled time." },
  ]

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <GuideSection title="Getting Started">
        <p className="mb-4">
          Welcome to OmniPost! This guide will help you understand how to use our platform effectively to{" "}
          <TermTooltip
            term="Repurpose"
            definition="Transform existing content into multiple formats suitable for different social media platforms"
          >
            repurpose
          </TermTooltip>{" "}
          and schedule your content across various social media platforms.
        </p>
        <h3 className="text-xl font-semibold mb-2">OmniPost Workflow</h3>
        <InteractiveTimeline events={workflowEvents} />
      </GuideSection>

      <GuideSection title="Repurposing Content">
        <p className="mb-2">Learn how to transform your long-form content into platform-specific posts:</p>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>Navigate to the 'Repurpose' page from the dashboard.</li>
          <li>Paste your long-form content or upload a file.</li>
          <li>Select the social media platforms you want to create content for.</li>
          <li>
            Choose your desired{" "}
            <TermTooltip term="Tone" definition="The overall attitude or character of the content">
              tone
            </TermTooltip>{" "}
            and content length.
          </li>
          <li>Click 'Repurpose' and wait for the AI to generate your posts.</li>
          <li>Review and edit the generated content as needed.</li>
        </ol>
      </GuideSection>

      <GuideSection title="Managing Drafts">
        <p className="mb-2">
          After repurposing your content, you can manage your{" "}
          <TermTooltip
            term="Drafts"
            definition="Unpublished versions of your posts that you can edit and schedule later"
          >
            drafts
          </TermTooltip>{" "}
          in the History page:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>View all your repurposed content in one place.</li>
          <li>Edit drafts by clicking on the 'Edit' button.</li>
          <li>Delete unwanted drafts using the 'Delete' button.</li>
          <li>Schedule posts directly from the History page.</li>
        </ul>
      </GuideSection>

      <GuideSection title="Scheduling Posts">
        <p className="mb-2">To schedule your posts:</p>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>Go to the 'Schedule' page or click 'Schedule' on a draft in the History page.</li>
          <li>
            Select the{" "}
            <TermTooltip term="UTC" definition="Coordinated Universal Time, the primary time standard used worldwide">
              UTC
            </TermTooltip>{" "}
            date and time for your post.
          </li>
          <li>Choose the social media platform for the post.</li>
          <li>Review the content one last time.</li>
          <li>Click 'Schedule' to confirm.</li>
        </ol>
        <p className="mt-4 mb-2">
          Remember, all scheduled times are in UTC. Use the widget below to check the current UTC time:
        </p>
        <div className="mt-4">
          <UtcClockWidget />
        </div>
      </GuideSection>

      <GuideSection title="Understanding UTC and Timing">
        <p className="mb-2">
          <TermTooltip term="UTC" definition="Coordinated Universal Time, the primary time standard used worldwide">
            UTC
          </TermTooltip>{" "}
          (Coordinated Universal Time) is the primary time standard by which the world regulates clocks and time. Using
          UTC ensures consistency across different time zones.
        </p>
        <h3 className="text-xl font-semibold mt-4 mb-2">Why UTC?</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Eliminates confusion with daylight saving time changes.</li>
          <li>Ensures posts go out at the intended time, regardless of your current location.</li>
          <li>Allows for easier coordination of global social media campaigns.</li>
        </ul>
        <p className="mt-4">
          To convert UTC to your local time, subtract or add the appropriate number of hours based on your{" "}
          <TermTooltip term="Time zone" definition="A region where the same standard time is used">
            time zone
          </TermTooltip>
          .
        </p>
      </GuideSection>

      <GuideSection title="Monitoring Post Status">
        <p className="mb-2">You can track the status of your posts in the History page:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>
            <span className="font-semibold">
              <TermTooltip term="Draft" definition="An unpublished version of your post that you can edit">
                Draft
              </TermTooltip>
              :
            </span>{" "}
            Content that has been repurposed but not yet scheduled.
          </li>
          <li>
            <span className="font-semibold">
              <TermTooltip term="Scheduled" definition="A post that is set to be published at a specific time">
                Scheduled
              </TermTooltip>
              :
            </span>{" "}
            Posts that have been scheduled and are waiting to be published.
          </li>
          <li>
            <span className="font-semibold">
              <TermTooltip
                term="Published"
                definition="A post that has been successfully posted to a social media platform"
              >
                Published
              </TermTooltip>
              :
            </span>{" "}
            Posts that have been successfully posted to the respective platforms.
          </li>
          <li>
            <span className="font-semibold">
              <TermTooltip term="Failed" definition="A post that encountered an error during the publishing process">
                Failed
              </TermTooltip>
              :
            </span>{" "}
            Posts that encountered an error during the publishing process.
          </li>
        </ul>
        <p className="mt-4">
          If a post fails to publish, you'll receive a{" "}
          <TermTooltip term="Notification" definition="An alert or message informing you about important events">
            notification
          </TermTooltip>
          . You can then reschedule the post or troubleshoot any issues.
        </p>
      </GuideSection>
    </div>
  )
}

