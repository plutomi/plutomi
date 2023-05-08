import {
  Button,
  Card,
  Col,
  Divider,
  Input,
  Row,
  Space,
  Typography
} from "antd";
import { useState } from "react";
import { colors } from "@/utils";

import type { SizeType } from "antd/es/config-provider/SizeContext";
import { GithubOutlined, TwitterOutlined } from "@ant-design/icons";
import { ExternalLink } from "../ExternalLink/ExternalLink";

const { Text, Paragraph, Title } = Typography;
const buttonSize: SizeType = "large";
const plutomiGithub = "https://github.com/plutomi/plutomi";
const joseTwitter = "https://twitter.com/notjoswayski";

export const HoverCard: React.FC = () => {
  const borderSize = 0;
  return (
    <Card
      title="Hi there!"
      bordered={false}
      style={{ width: 600, textAlign: "start" }}
    >
      <Space size={6} direction="vertical">
        <Row justify="center" style={{ border: `${borderSize}px solid red` }}>
          <Paragraph>
            To enhance the long term stability of the site, I (Jose) am doing a
            major refactor. You can check the progress and all changes on GitHub
            or DM me on Twitter or by email if you have any questions :)
          </Paragraph>
        </Row>

        <Row justify="center" style={{ border: `${borderSize}px solid blue` }}>
          <Text strong copyable style={{ alignSelf: "center" }}>
            jose@plutomi.com
          </Text>
        </Row>

        <Row
          justify="space-around"
          style={{ paddingTop: "1rem", border: `${borderSize}px solid orange` }}
        >
          <Button size={buttonSize} type="link" href={plutomiGithub}>
            Plutomi on <GithubOutlined style={{ color: colors.github }} />
          </Button>

          <Button size={buttonSize} type="link" href={joseTwitter}>
            Jose on <TwitterOutlined style={{ color: colors.twitter }} />
          </Button>
        </Row>
        <Divider />
        <Row>
          <Text>
            If you would like to be notified when we launch, we can send you an
            email!
          </Text>
        </Row>

        <Row justify="space-between">
          <Col span={20}>
            <Space direction="vertical" size={8}>
              <Input placeholder="example@mail.com" />
              <Text type="secondary">
                We won&apos;t spam, we don&apos;t even have the ability to send
                emails yet! :)
              </Text>
            </Space>
          </Col>
          <Col>
            <Button type="primary">Submit</Button>
          </Col>
        </Row>

        <Divider />
        <Text type="secondary">This site is current as of BLAH</Text>
      </Space>
    </Card>
  );
};
