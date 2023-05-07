import { Button, Card, Row, Col, Space, Typography } from "antd";
import { useState } from "react";
import type { SizeType } from "antd/es/config-provider/SizeContext";
import { ExternalLink } from "../ExternalLink/ExternalLink";

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
      headStyle={{ textAlign: "start" }}
      bodyStyle={{ textAlign: "start" }}
      style={{ width: 500 }}
    >
      <Paragraph>
        To enhance the long term stability of the site, I (Jose) am doing a
        major refactor. You can check the progress and all changes on GitHub or
        DM me on Twitter or by email if you have any questions :)
      </Paragraph>
      <Space />
      <Text>jose@plutomi.com</Text>
      <Row justify="space-around" style={{ paddingTop: "20px" }}>
        <ExternalLink href={plutomiGithub}>
          <Button size={buttonSize}>Plutomi on GitHub</Button>
        </ExternalLink>

        <ExternalLink href={joseTwitter}>
          <Button size={buttonSize}>Jose on Twitter</Button>
        </ExternalLink>
      </Row>
    </Card>
  ) : null;
};
