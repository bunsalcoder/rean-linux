import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { CodeBlock } from "@/components/ui/code-block";
import { Terminal } from "@/components/ui/terminal";
import { TextLink } from "@/components/ui/text-link";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <PageContainer>
      <PageHeader
        title={siteConfig.name}
        description='Rean means "Learn" in Khmer. This site will teach Linux from absolute beginner through advanced, practical system work.'
      />
      <p className="mt-6 leading-relaxed">
        The learning platform is being set up. Start at{" "}
        <TextLink href="/learn">Learn</TextLink> when you are ready to browse
        upcoming topics, or read <TextLink href="/about">About</TextLink> for
        the project direction.
      </p>
      <div className="mt-10 space-y-6">
        <Terminal
          title="terminal"
          language="bash"
          lines={[
            { command: "sudo apt update" },
            { command: "sudo apt upgrade" },
          ]}
        />
        <CodeBlock
          language="bash"
          code={"ls -la /var/log\ncat /etc/os-release"}
        />
      </div>
    </PageContainer>
  );
}
