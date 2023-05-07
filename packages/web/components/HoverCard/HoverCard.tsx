import { Button, Card, Row, Space, Typography } from "antd";
import { useState } from "react";
import type { SizeType } from "antd/es/config-provider/SizeContext";
import { ExternalLink } from "../ExternalLink/ExternalLink";
import { GithubOutlined, TwitterOutlined } from "@ant-design/icons";

const { Text, Paragraph } = Typography;
const buttonSize: SizeType = "large";
const plutomiGithub = "https://github.com/plutomi/plutomi";
const joseTwitter = "https://twitter.com/notjoswayski";

export const HoverCard: React.FC = () => {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
  };

  return visible ? (
    <Card
      title="Hi there!"
      extra={
        <Button type="text" danger onClick={handleClose}>
          Close
        </Button>
      }
      style={{ width: 500, textAlign: "start" }}
    >
      <Paragraph>
        To enhance the long term stability of the site, I (Jose) am doing a
        major refactor. You can check the progress and all changes on GitHub or
        DM me on Twitter or by email if you have any questions :)
      </Paragraph>
      <Space />
      <Row justify="center">
        <Text strong copyable>
          jose@plutomi.com
        </Text>
      </Row>
      <Row
        gutter={[0, 10]}
        justify="space-around"
        style={{ paddingTop: "20px" }}
      >
        <ExternalLink href={plutomiGithub}>
          <Button size={buttonSize}>Plutomi on <GithubOutlined style={{ color: "#333"}} /></Button>
        </ExternalLink>

        <ExternalLink href={joseTwitter}>
          <Button size={buttonSize}>
            Jose on <TwitterOutlined style={{ color: "#00acee" }} />
          </Button>
        </ExternalLink>
      </Row>
    </Card>
  ) : null;
};
